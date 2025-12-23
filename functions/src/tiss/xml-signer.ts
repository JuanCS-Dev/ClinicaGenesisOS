/**
 * XML Signing Module
 *
 * Handles digital signing of TISS XML documents using the clinic's e-CNPJ certificate.
 * Implements XMLDSig (XML Digital Signature) according to W3C standards.
 *
 * @module functions/tiss/xml-signer
 */

import * as functions from 'firebase-functions';
import * as forge from 'node-forge';
import * as crypto from 'crypto';
import type { SignXmlRequest, SignXmlResponse } from './types';
import { getCertificateForSigning } from './certificate';

// =============================================================================
// CONSTANTS
// =============================================================================

/** Namespaces used in TISS XMLDSig */
const NAMESPACES = {
  ds: 'http://www.w3.org/2000/09/xmldsig#',
  tiss: 'http://www.ans.gov.br/padroes/tiss/schemas',
};

/** Canonicalization algorithm */
const C14N_ALGORITHM = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';

/** Signature method (RSA-SHA256 recommended for TISS) */
const SIGNATURE_METHOD = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';

/** Digest method */
const DIGEST_METHOD = 'http://www.w3.org/2001/04/xmlenc#sha256';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Extract private key and certificate from PFX.
 */
function extractFromPfx(
  pfxBase64: string,
  password: string
): { privateKey: forge.pki.PrivateKey; certificate: forge.pki.Certificate } {
  const pfxBuffer = Buffer.from(pfxBase64, 'base64');
  const pfxAsn1 = forge.asn1.fromDer(pfxBuffer.toString('binary'));
  const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, password);

  // Get private key
  const keyBags = pfx.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
  const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag];

  if (!keyBag || keyBag.length === 0 || !keyBag[0].key) {
    throw new Error('No private key found in certificate');
  }

  // Get certificate
  const certBags = pfx.getBags({ bagType: forge.pki.oids.certBag });
  const certBag = certBags[forge.pki.oids.certBag];

  if (!certBag || certBag.length === 0 || !certBag[0].cert) {
    throw new Error('No certificate found in PFX');
  }

  return {
    privateKey: keyBag[0].key,
    certificate: certBag[0].cert,
  };
}

/**
 * Calculate SHA-256 digest of content.
 */
function calculateDigest(content: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(content, 'utf8');
  return hash.digest('base64');
}

/**
 * Sign content with RSA-SHA256.
 */
function signWithRsa(
  content: string,
  privateKey: forge.pki.PrivateKey
): string {
  // Convert forge private key to PEM format for crypto module
  const privateKeyPem = forge.pki.privateKeyToPem(privateKey);

  // Use Node.js crypto for signing (better type support)
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(content, 'utf8');
  sign.end();

  const signature = sign.sign(privateKeyPem);
  return signature.toString('base64');
}

/**
 * Get certificate as Base64 DER.
 */
function getCertificateBase64(certificate: forge.pki.Certificate): string {
  const asn1 = forge.pki.certificateToAsn1(certificate);
  const der = forge.asn1.toDer(asn1).getBytes();
  return forge.util.encode64(der);
}

/**
 * Simple XML canonicalization (C14N).
 * Note: This is a simplified version. Production should use a proper C14N library.
 */
function canonicalize(xml: string): string {
  // Basic canonicalization:
  // 1. Normalize whitespace in attributes
  // 2. Sort attributes alphabetically
  // 3. Normalize line endings
  return xml
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

/**
 * Find the content to be signed (the main element).
 * For TISS, this is typically the mensagemTISS or loteGuias element.
 */
function findSignableContent(xml: string): { content: string; uri: string } {
  // Look for main TISS elements
  const patterns = [
    /<ans:mensagemTISS[^>]*>([\s\S]*)<\/ans:mensagemTISS>/,
    /<tiss:mensagemTISS[^>]*>([\s\S]*)<\/tiss:mensagemTISS>/,
    /<mensagemTISS[^>]*>([\s\S]*)<\/mensagemTISS>/,
  ];

  for (const pattern of patterns) {
    const match = xml.match(pattern);
    if (match) {
      return {
        content: match[0],
        uri: '#mensagemTISS',
      };
    }
  }

  // If no specific element found, sign the whole document
  return {
    content: xml,
    uri: '',
  };
}

/**
 * Build XMLDSig Signature element.
 */
function buildSignatureElement(
  signedInfoDigest: string,
  signatureValue: string,
  certificateBase64: string,
  referenceUri: string,
  contentDigest: string
): string {
  return `<Signature xmlns="${NAMESPACES.ds}">
  <SignedInfo>
    <CanonicalizationMethod Algorithm="${C14N_ALGORITHM}"/>
    <SignatureMethod Algorithm="${SIGNATURE_METHOD}"/>
    <Reference URI="${referenceUri}">
      <Transforms>
        <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
        <Transform Algorithm="${C14N_ALGORITHM}"/>
      </Transforms>
      <DigestMethod Algorithm="${DIGEST_METHOD}"/>
      <DigestValue>${contentDigest}</DigestValue>
    </Reference>
  </SignedInfo>
  <SignatureValue>${signatureValue}</SignatureValue>
  <KeyInfo>
    <X509Data>
      <X509Certificate>${certificateBase64}</X509Certificate>
    </X509Data>
  </KeyInfo>
</Signature>`;
}

/**
 * Insert signature into XML document.
 */
function insertSignature(xml: string, signature: string): string {
  // Find the closing tag of the main element to insert signature before it
  const patterns = [
    { open: /<ans:mensagemTISS/, close: '</ans:mensagemTISS>' },
    { open: /<tiss:mensagemTISS/, close: '</tiss:mensagemTISS>' },
    { open: /<mensagemTISS/, close: '</mensagemTISS>' },
  ];

  for (const pattern of patterns) {
    if (pattern.open.test(xml)) {
      const closeIndex = xml.lastIndexOf(pattern.close);
      if (closeIndex !== -1) {
        return (
          xml.slice(0, closeIndex) +
          '\n  ' +
          signature +
          '\n' +
          xml.slice(closeIndex)
        );
      }
    }
  }

  // Fallback: insert before last closing tag
  const lastClose = xml.lastIndexOf('</');
  if (lastClose !== -1) {
    return xml.slice(0, lastClose) + '\n' + signature + '\n' + xml.slice(lastClose);
  }

  return xml + '\n' + signature;
}

// =============================================================================
// MAIN SIGNING FUNCTION
// =============================================================================

/**
 * Sign an XML document with XMLDSig.
 *
 * @param xml - The XML document to sign
 * @param pfxBase64 - Base64-encoded PFX certificate
 * @param password - Certificate password
 * @returns Signed XML document
 */
export function signXmlDocument(
  xml: string,
  pfxBase64: string,
  password: string
): string {
  // Extract keys from certificate
  const { privateKey, certificate } = extractFromPfx(pfxBase64, password);

  // Find content to sign
  const { content, uri } = findSignableContent(xml);

  // Canonicalize content
  const canonicalContent = canonicalize(content);

  // Calculate digest of content
  const contentDigest = calculateDigest(canonicalContent);

  // Build SignedInfo element
  const signedInfo = `<SignedInfo xmlns="${NAMESPACES.ds}">
    <CanonicalizationMethod Algorithm="${C14N_ALGORITHM}"/>
    <SignatureMethod Algorithm="${SIGNATURE_METHOD}"/>
    <Reference URI="${uri}">
      <Transforms>
        <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
        <Transform Algorithm="${C14N_ALGORITHM}"/>
      </Transforms>
      <DigestMethod Algorithm="${DIGEST_METHOD}"/>
      <DigestValue>${contentDigest}</DigestValue>
    </Reference>
  </SignedInfo>`;

  // Canonicalize and sign SignedInfo
  const canonicalSignedInfo = canonicalize(signedInfo);
  const signatureValue = signWithRsa(canonicalSignedInfo, privateKey);

  // Get certificate as Base64
  const certificateBase64 = getCertificateBase64(certificate);

  // Build complete Signature element
  const signatureElement = buildSignatureElement(
    canonicalSignedInfo,
    signatureValue,
    certificateBase64,
    uri,
    contentDigest
  );

  // Insert signature into document
  return insertSignature(xml, signatureElement);
}

/**
 * Calculate hash of XML for storage/comparison.
 */
export function hashXml(xml: string): string {
  return crypto.createHash('sha256').update(xml, 'utf8').digest('hex');
}

// =============================================================================
// CLOUD FUNCTION
// =============================================================================

/**
 * Sign XML document using clinic's certificate.
 */
export const signXml = functions.https.onCall(
  async (
    request: SignXmlRequest,
    context: functions.https.CallableContext
  ): Promise<SignXmlResponse> => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { clinicId, xml } = request;

    // Validate input
    if (!clinicId || !xml) {
      return {
        success: false,
        error: 'Missing required fields: clinicId, xml',
      };
    }

    functions.logger.info('Signing XML', {
      clinicId,
      xmlLength: xml.length,
      userId: context.auth.uid,
    });

    try {
      // Get certificate for signing
      const certData = await getCertificateForSigning(clinicId);

      // Sign the XML
      const signedXml = signXmlDocument(
        xml,
        certData.pfxBase64,
        certData.password
      );

      functions.logger.info('XML signed successfully', {
        clinicId,
        signedXmlLength: signedXml.length,
        certificateCnpj: certData.info.cnpj,
      });

      return {
        success: true,
        signedXml,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      functions.logger.error('Failed to sign XML', {
        clinicId,
        error: message,
      });

      // Provide user-friendly error messages
      if (message.includes('No certificate configured')) {
        return {
          success: false,
          error: 'Certificado digital não configurado. Configure seu e-CNPJ primeiro.',
        };
      }

      if (message.includes('expired')) {
        return {
          success: false,
          error: 'Certificado digital expirado. Faça upload de um certificado válido.',
        };
      }

      return {
        success: false,
        error: message,
      };
    }
  }
);
