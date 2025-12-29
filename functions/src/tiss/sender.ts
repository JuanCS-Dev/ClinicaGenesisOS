/**
 * TISS Sender - Sends signed XML documents to operadoras via WebService.
 * @module functions/tiss/sender
 */
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as https from 'https'
import * as http from 'http'
import { requireAuthRoleAndClinicV1, checkRateLimitForUser } from '../middleware/index.js'
import type {
  SendLoteRequest,
  SendLoteResponse,
  WebServiceConfig,
  WebServiceResponse,
  GuiaStatus,
} from './types'
import { signXmlDocument, hashXml } from './xml-signer'
import { getCertificateForSigning } from './certificate'
import { getLote, updateLoteStatus } from './lote'

const GUIAS_COLLECTION = 'guias'
const OPERADORAS_COLLECTION = 'operadoras'
const DEFAULT_TIMEOUT = 30000

const SOAP_ENVELOPE = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header/>
  <soap:Body>
    {{CONTENT}}
  </soap:Body>
</soap:Envelope>`

/** Get WebService configuration for an operadora. */
async function getWebServiceConfig(
  clinicId: string,
  operadoraId: string
): Promise<WebServiceConfig | null> {
  const db = admin.firestore()
  const operadorasRef = db.collection('clinics').doc(clinicId).collection(OPERADORAS_COLLECTION)

  const query = await operadorasRef.where('registroANS', '==', operadoraId).limit(1).get()

  if (query.empty) {
    return null
  }

  const operadora = query.docs[0].data()
  return operadora.webService as WebServiceConfig | null
}

/**
 * Build SOAP envelope for TISS submission.
 */
function buildSoapEnvelope(tissXml: string): string {
  return SOAP_ENVELOPE.replace('{{CONTENT}}', tissXml)
}

/**
 * Parse SOAP response from operadora.
 */
function parseSoapResponse(responseXml: string): WebServiceResponse {
  // Look for protocol number in response
  const protocoloMatch = responseXml.match(
    /<(?:ans:|tiss:|)numeroProtocolo>([^<]+)<\/(?:ans:|tiss:|)numeroProtocolo>/
  )

  // Look for error messages
  const errorMatch = responseXml.match(
    /<(?:ans:|tiss:|)mensagem>([^<]+)<\/(?:ans:|tiss:|)mensagem>/
  )

  const codigoMatch = responseXml.match(/<(?:ans:|tiss:|)codigo>([^<]+)<\/(?:ans:|tiss:|)codigo>/)

  // Check for SOAP Fault
  const faultMatch = responseXml.match(
    /<soap:Fault>[\s\S]*?<faultstring>([^<]+)<\/faultstring>[\s\S]*?<\/soap:Fault>/
  )

  if (faultMatch) {
    return {
      success: false,
      mensagem: faultMatch[1],
      xmlResposta: responseXml,
      errors: [{ codigo: 'SOAP_FAULT', mensagem: faultMatch[1] }],
    }
  }

  if (protocoloMatch) {
    return {
      success: true,
      protocolo: protocoloMatch[1],
      mensagem: errorMatch?.[1] || 'Lote recebido com sucesso',
      xmlResposta: responseXml,
    }
  }

  // If no protocol, check if there's an error
  if (errorMatch || codigoMatch) {
    return {
      success: false,
      mensagem: errorMatch?.[1] || 'Erro no processamento',
      xmlResposta: responseXml,
      errors: [
        {
          codigo: codigoMatch?.[1] || 'UNKNOWN',
          mensagem: errorMatch?.[1] || 'Erro desconhecido',
        },
      ],
    }
  }

  // Couldn't parse response
  return {
    success: false,
    mensagem: 'Resposta da operadora não reconhecida',
    xmlResposta: responseXml,
    errors: [{ codigo: 'PARSE_ERROR', mensagem: 'Formato de resposta desconhecido' }],
  }
}

/**
 * Send HTTP request to WebService.
 */
async function sendHttpRequest(
  config: WebServiceConfig,
  soapXml: string,
  pfxBase64?: string,
  pfxPassword?: string
): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(config.url)
    const isHttps = url.protocol === 'https:'

    const headers: Record<string, string | number> = {
      'Content-Type': 'application/soap+xml; charset=utf-8',
      'Content-Length': Buffer.byteLength(soapXml, 'utf8'),
      SOAPAction: 'tissLoteGuias',
    }

    // Add authentication based on type
    if (config.authType === 'basic' && config.username && config.password) {
      const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64')
      headers['Authorization'] = `Basic ${auth}`
    } else if (config.authType === 'token' && config.token) {
      headers['Authorization'] = `Bearer ${config.token}`
    }

    const options: https.RequestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      timeout: config.timeout || DEFAULT_TIMEOUT,
      headers,
    }

    // For certificate auth, add client certificate
    if (config.authType === 'certificate' && pfxBase64 && pfxPassword) {
      ;(options as https.RequestOptions).pfx = Buffer.from(pfxBase64, 'base64')
      ;(options as https.RequestOptions).passphrase = pfxPassword
    }

    const protocol = isHttps ? https : http
    const req = protocol.request(options, res => {
      let body = ''
      res.on('data', chunk => (body += chunk))
      res.on('end', () => {
        resolve({ statusCode: res.statusCode || 500, body })
      })
    })

    req.on('error', error => {
      reject(new Error(`WebService connection failed: ${error.message}`))
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('WebService request timed out'))
    })

    req.write(soapXml)
    req.end()
  })
}

/**
 * Update guia statuses after successful submission.
 */
async function updateGuiaStatuses(
  clinicId: string,
  guiaIds: string[],
  status: GuiaStatus,
  loteId: string,
  protocolo?: string
): Promise<void> {
  const db = admin.firestore()
  const batch = db.batch()
  const now = new Date().toISOString()

  const guiasRef = db.collection('clinics').doc(clinicId).collection(GUIAS_COLLECTION)

  for (const guiaId of guiaIds) {
    batch.update(guiasRef.doc(guiaId), {
      status,
      loteId,
      protocoloOperadora: protocolo,
      dataEnvio: now,
      updatedAt: now,
    })
  }

  await batch.commit()
}

// =============================================================================
// CLOUD FUNCTION
// =============================================================================

/**
 * Send a lote to the operadora's WebService.
 *
 * This function:
 * 1. Retrieves the lote and validates it's ready to send
 * 2. Gets the operadora's WebService configuration
 * 3. Signs the XML with the clinic's certificate
 * 4. Sends the signed XML to the WebService
 * 5. Parses the response and updates statuses
 */
export const sendLote = functions
  .runWith({ timeoutSeconds: 120, memory: '512MB' })
  .https.onCall(
    async (
      request: SendLoteRequest,
      context: functions.https.CallableContext
    ): Promise<SendLoteResponse> => {
      const { clinicId, loteId } = request

      // Validate input first
      if (!clinicId || !loteId) {
        return {
          success: false,
          error: 'Missing required fields: clinicId, loteId',
        }
      }

      // Validate auth, role (professional+), and clinic access
      const authContext = requireAuthRoleAndClinicV1(context, clinicId, [
        'owner',
        'admin',
        'professional',
      ])

      // Rate limiting for TISS operations
      await checkRateLimitForUser(authContext.userId, 'TISS_BATCH')

      functions.logger.info('Sending lote', {
        clinicId,
        loteId,
        userId: authContext.userId,
      })

      try {
        // Get lote
        const lote = await getLote(clinicId, loteId)
        if (!lote) {
          return { success: false, error: 'Lote não encontrado' }
        }

        // Validate lote status
        if (!['rascunho', 'pronto', 'erro'].includes(lote.status)) {
          return {
            success: false,
            error: `Lote já foi enviado (status: ${lote.status})`,
          }
        }

        // Check if lote has XML content
        if (!lote.xmlContent) {
          return {
            success: false,
            error: 'Lote não possui XML gerado. Gere o XML primeiro.',
          }
        }

        // Update status to sending
        await updateLoteStatus(clinicId, loteId, 'enviando')

        // Get WebService config
        const wsConfig = await getWebServiceConfig(clinicId, lote.registroANS)
        if (!wsConfig) {
          await updateLoteStatus(clinicId, loteId, 'erro', {
            erros: [{ codigo: 'NO_WEBSERVICE', mensagem: 'WebService não configurado' }],
          })
          return {
            success: false,
            error: 'WebService da operadora não configurado',
          }
        }

        // Get certificate for signing (if not already signed)
        let signedXml = lote.xmlContent
        if (!lote.xmlContent.includes('<Signature')) {
          const certData = await getCertificateForSigning(clinicId)
          signedXml = signXmlDocument(lote.xmlContent, certData.pfxBase64, certData.password)
        }

        // Build SOAP envelope
        const soapXml = buildSoapEnvelope(signedXml)

        // Get certificate for mTLS if needed
        let pfxBase64: string | undefined
        let pfxPassword: string | undefined

        if (wsConfig.authType === 'certificate') {
          const certData = await getCertificateForSigning(clinicId)
          pfxBase64 = certData.pfxBase64
          pfxPassword = certData.password
        }

        // Send to WebService
        const httpResponse = await sendHttpRequest(wsConfig, soapXml, pfxBase64, pfxPassword)

        // Parse response
        const wsResponse = parseSoapResponse(httpResponse.body)
        wsResponse.httpStatus = httpResponse.statusCode

        const now = new Date().toISOString()

        if (wsResponse.success && wsResponse.protocolo) {
          // Success - update lote and guias
          await updateLoteStatus(clinicId, loteId, 'enviado', {
            protocolo: wsResponse.protocolo,
            dataEnvio: now,
            xmlContent: signedXml,
            xmlHash: hashXml(signedXml),
          })

          await updateGuiaStatuses(clinicId, lote.guiaIds, 'enviada', loteId, wsResponse.protocolo)

          functions.logger.info('Lote sent successfully', {
            clinicId,
            loteId,
            protocolo: wsResponse.protocolo,
          })

          return {
            success: true,
            protocolo: wsResponse.protocolo,
            dataEnvio: now,
            xmlEnviado: signedXml,
            xmlResposta: wsResponse.xmlResposta,
          }
        } else {
          // Error - update lote status
          await updateLoteStatus(clinicId, loteId, 'erro', {
            erros: wsResponse.errors?.map(e => ({
              codigo: e.codigo,
              mensagem: e.mensagem,
            })),
          })

          functions.logger.error('Lote submission failed', {
            clinicId,
            loteId,
            errors: wsResponse.errors,
          })

          return {
            success: false,
            error: wsResponse.mensagem,
            errorCode: wsResponse.errors?.[0]?.codigo,
            xmlResposta: wsResponse.xmlResposta,
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'

        // Update lote status on error
        try {
          await updateLoteStatus(clinicId, loteId, 'erro', {
            erros: [{ codigo: 'SEND_ERROR', mensagem: message }],
          })
        } catch {
          // Ignore status update errors
        }

        functions.logger.error('Failed to send lote', {
          clinicId,
          loteId,
          error: message,
        })

        // Provide user-friendly error messages
        if (message.includes('certificate')) {
          return {
            success: false,
            error: 'Erro no certificado digital. Verifique se está configurado corretamente.',
          }
        }

        if (message.includes('timeout')) {
          return {
            success: false,
            error: 'Timeout na conexão com a operadora. Tente novamente.',
          }
        }

        if (message.includes('connection')) {
          return {
            success: false,
            error: 'Falha na conexão com a operadora. Verifique a URL do WebService.',
          }
        }

        return {
          success: false,
          error: message,
        }
      }
    }
  )

/**
 * Retry sending a failed lote.
 */
export const retrySendLote = functions.https.onCall(
  async (
    request: SendLoteRequest,
    context: functions.https.CallableContext
  ): Promise<SendLoteResponse> => {
    const { clinicId, loteId } = request

    if (!clinicId || !loteId) {
      return { success: false, error: 'Missing clinicId or loteId' }
    }

    // Validate auth, role (professional+), and clinic access
    const authContext = requireAuthRoleAndClinicV1(context, clinicId, [
      'owner',
      'admin',
      'professional',
    ])

    // Rate limiting
    await checkRateLimitForUser(authContext.userId, 'TISS_BATCH')

    // Get lote
    const lote = await getLote(clinicId, loteId)
    if (!lote) {
      return { success: false, error: 'Lote não encontrado' }
    }

    // Only allow retry for error status
    if (lote.status !== 'erro') {
      return {
        success: false,
        error: `Só é possível reenviar lotes com erro (status atual: ${lote.status})`,
      }
    }

    // Reset status and call sendLote
    await updateLoteStatus(clinicId, loteId, 'pronto', {
      erros: [],
    })

    // Use sendLote logic
    return sendLote.run(request, context)
  }
)
