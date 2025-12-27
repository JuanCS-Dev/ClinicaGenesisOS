 
/**
 * Sender Module Tests
 *
 * Tests for sending lotes to operadoras via WebService.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Fixed test key
const TEST_ENCRYPTION_KEY = 'K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=';

// Mock firebase-functions/params
vi.mock('firebase-functions/params', () => ({
  defineString: () => ({
    value: () => TEST_ENCRYPTION_KEY,
  }),
}));

// Mock firebase-functions
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

vi.mock('firebase-functions', () => ({
  https: {
    onCall: vi.fn((handler) => handler),
    HttpsError: class HttpsError extends Error {
      constructor(public code: string, message: string) {
        super(message);
      }
    },
  },
  runWith: vi.fn(() => ({
    https: {
      onCall: vi.fn((handler) => handler),
    },
  })),
  logger: mockLogger,
}));

// Mock getLote and updateLoteStatus
let mockLoteData: any = null;

vi.mock('../lote', () => ({
  getLote: vi.fn(() => Promise.resolve(mockLoteData)),
  updateLoteStatus: vi.fn(() => Promise.resolve()),
}));

// Mock getCertificateForSigning and signXmlDocument
vi.mock('../certificate', () => ({
  getCertificateForSigning: vi.fn(() =>
    Promise.resolve({
      pfxBase64: 'mock-pfx',
      password: 'mock-password',
      info: { cnpj: '12.345.678/0001-90' },
    })
  ),
}));

vi.mock('../xml-signer', () => ({
  signXmlDocument: vi.fn((xml) => `<signed>${xml}</signed>`),
  hashXml: vi.fn(() => 'mock-hash-123'),
}));

// Mock Firestore
const mockBatchCommit = vi.fn(() => Promise.resolve());
const mockBatch = {
  update: vi.fn(),
  commit: mockBatchCommit,
};

let mockOperadoraWebService: any = null;

const mockFirestore = {
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({
      collection: vi.fn((name: string) => {
        if (name === 'operadoras') {
          return {
            where: vi.fn(() => ({
              limit: vi.fn(() => ({
                get: vi.fn(() =>
                  Promise.resolve({
                    empty: !mockOperadoraWebService,
                    docs: mockOperadoraWebService
                      ? [{ data: () => ({ webService: mockOperadoraWebService }) }]
                      : [],
                  })
                ),
              })),
            })),
          };
        }
        if (name === 'guias') {
          return {
            doc: vi.fn(() => ({
              update: vi.fn(() => Promise.resolve()),
            })),
          };
        }
        return {};
      }),
    })),
  })),
  batch: vi.fn(() => mockBatch),
};

vi.mock('firebase-admin', () => ({
  firestore: vi.fn(() => mockFirestore),
}));

// Mock HTTP request
let mockHttpResponse: { statusCode: number; body: string } = {
  statusCode: 200,
  body: '<ans:numeroProtocolo>PROT123</ans:numeroProtocolo>',
};

vi.mock('https', () => ({
  request: vi.fn((options, callback) => {
    const mockRes = {
      statusCode: mockHttpResponse.statusCode,
      on: vi.fn((event, handler) => {
        if (event === 'data') {
          handler(mockHttpResponse.body);
        }
        if (event === 'end') {
          handler();
        }
        return mockRes;
      }),
    };

    // Call callback immediately to simulate response
    setTimeout(() => callback(mockRes), 0);

    return {
      on: vi.fn(() => ({})),
      write: vi.fn(),
      end: vi.fn(),
      destroy: vi.fn(),
    };
  }),
}));

vi.mock('http', () => ({
  request: vi.fn((options, callback) => {
    const mockRes = {
      statusCode: mockHttpResponse.statusCode,
      on: vi.fn((event, handler) => {
        if (event === 'data') {
          handler(mockHttpResponse.body);
        }
        if (event === 'end') {
          handler();
        }
        return mockRes;
      }),
    };

    setTimeout(() => callback(mockRes), 0);

    return {
      on: vi.fn(() => ({})),
      write: vi.fn(),
      end: vi.fn(),
      destroy: vi.fn(),
    };
  }),
}));

// =============================================================================
// TESTS
// =============================================================================

describe('sender', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoteData = null;
    mockOperadoraWebService = null;
    mockHttpResponse = {
      statusCode: 200,
      body: '<ans:numeroProtocolo>PROT123</ans:numeroProtocolo>',
    };
  });

  describe('sendLote', () => {
    it('should require authentication', async () => {
      const { sendLote } = await import('../sender');

      await expect(
        sendLote(
          { clinicId: 'test', loteId: 'lote-1' },
          { auth: null } as any
        )
      ).rejects.toThrow('Must be authenticated');
    });

    it('should reject missing fields', async () => {
      const { sendLote } = await import('../sender');

      const result = await sendLote(
        { clinicId: '', loteId: '' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required fields');
    });

    it('should reject if lote not found', async () => {
      const { sendLote } = await import('../sender');

      mockLoteData = null;

      const result = await sendLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('não encontrado');
    });

    it('should reject if lote already sent', async () => {
      const { sendLote } = await import('../sender');

      mockLoteData = {
        status: 'enviado',
        xmlContent: '<xml/>',
      };

      const result = await sendLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('já foi enviado');
    });

    it('should reject if lote has no XML', async () => {
      const { sendLote } = await import('../sender');

      mockLoteData = {
        status: 'rascunho',
        xmlContent: '', // No XML
      };

      const result = await sendLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('XML');
    });

    it('should reject if webservice not configured', async () => {
      const { sendLote } = await import('../sender');
      const { updateLoteStatus } = await import('../lote');

      mockLoteData = {
        status: 'rascunho',
        xmlContent: '<mensagemTISS/>',
        registroANS: '123456',
        guiaIds: ['g1'],
      };
      mockOperadoraWebService = null;

      const result = await sendLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('WebService');
      expect(updateLoteStatus).toHaveBeenCalled();
    });

    it('should send lote successfully', async () => {
      const { sendLote } = await import('../sender');
      const { updateLoteStatus } = await import('../lote');

      mockLoteData = {
        status: 'rascunho',
        xmlContent: '<mensagemTISS>test</mensagemTISS>',
        registroANS: '123456',
        guiaIds: ['g1', 'g2'],
      };
      mockOperadoraWebService = {
        url: 'https://ws.operadora.com.br/tiss',
        versaoTISS: '4.02.00',
        timeout: 30000,
        authType: 'certificate',
      };
      mockHttpResponse = {
        statusCode: 200,
        body: '<ans:numeroProtocolo>PROT123</ans:numeroProtocolo>',
      };

      const result = await sendLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(true);
      expect(result.protocolo).toBe('PROT123');
      expect(result.xmlEnviado).toBeDefined();
      expect(result.xmlResposta).toContain('PROT123');
      expect(updateLoteStatus).toHaveBeenCalledWith('test', 'lote-1', 'enviando');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Lote sent successfully',
        expect.any(Object)
      );
    });

    it('should handle WebService error response', async () => {
      const { sendLote } = await import('../sender');
      const { updateLoteStatus } = await import('../lote');

      mockLoteData = {
        status: 'rascunho',
        xmlContent: '<mensagemTISS>test</mensagemTISS>',
        registroANS: '123456',
        guiaIds: ['g1'],
      };
      mockOperadoraWebService = {
        url: 'https://ws.operadora.com.br/tiss',
        authType: 'basic',
        username: 'user',
        password: 'pass',
      };
      mockHttpResponse = {
        statusCode: 500,
        body: '<ans:codigo>ERR001</ans:codigo><ans:mensagem>Erro de validação</ans:mensagem>',
      };

      const result = await sendLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Erro de validação');
      expect(updateLoteStatus).toHaveBeenCalledWith(
        'test',
        'lote-1',
        'erro',
        expect.any(Object)
      );
    });

    it('should handle SOAP Fault', async () => {
      const { sendLote } = await import('../sender');

      mockLoteData = {
        status: 'pronto',
        xmlContent: '<mensagemTISS>test</mensagemTISS>',
        registroANS: '123456',
        guiaIds: ['g1'],
      };
      mockOperadoraWebService = {
        url: 'https://ws.operadora.com.br/tiss',
        authType: 'token',
        token: 'my-token',
      };
      mockHttpResponse = {
        statusCode: 500,
        body: '<soap:Fault><faultstring>Server Error</faultstring></soap:Fault>',
      };

      const result = await sendLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Server Error');
    });

    it('should skip signing if XML already signed', async () => {
      const { sendLote } = await import('../sender');
      const { signXmlDocument } = await import('../xml-signer');

      mockLoteData = {
        status: 'rascunho',
        xmlContent: '<mensagemTISS><Signature>existing</Signature></mensagemTISS>',
        registroANS: '123456',
        guiaIds: ['g1'],
      };
      mockOperadoraWebService = {
        url: 'https://ws.operadora.com.br/tiss',
        authType: 'certificate',
      };

      await sendLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      // signXmlDocument should not be called for already signed XML
      expect(signXmlDocument).not.toHaveBeenCalled();
    });

    it('should handle certificate error', async () => {
      const { sendLote } = await import('../sender');
      const { getCertificateForSigning } = await import('../certificate');

      vi.mocked(getCertificateForSigning).mockRejectedValueOnce(
        new Error('Certificate not found')
      );

      mockLoteData = {
        status: 'rascunho',
        xmlContent: '<mensagemTISS>test</mensagemTISS>',
        registroANS: '123456',
        guiaIds: ['g1'],
      };
      mockOperadoraWebService = {
        url: 'https://ws.operadora.com.br/tiss',
        authType: 'certificate',
      };

      const result = await sendLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      // Error should mention certificate (either in Portuguese or English)
      expect(
        result.error?.toLowerCase().includes('certificado') ||
        result.error?.toLowerCase().includes('certificate')
      ).toBe(true);
    });

    it('should handle timeout error', async () => {
      const { sendLote } = await import('../sender');

      mockLoteData = {
        status: 'rascunho',
        xmlContent: '<mensagemTISS>test</mensagemTISS>',
        registroANS: '123456',
        guiaIds: ['g1'],
      };
      mockOperadoraWebService = {
        url: 'https://ws.operadora.com.br/tiss',
        authType: 'certificate',
      };

      // Mock https to throw timeout error
      const https = await import('https');
      vi.mocked(https.request).mockImplementationOnce(() => {
        throw new Error('Request timed out');
      });

      const result = await sendLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
    });
  });

  describe('retrySendLote', () => {
    it('should require authentication', async () => {
      const { retrySendLote } = await import('../sender');

      await expect(
        retrySendLote(
          { clinicId: 'test', loteId: 'lote-1' },
          { auth: null } as any
        )
      ).rejects.toThrow('Must be authenticated');
    });

    it('should reject if lote not found', async () => {
      const { retrySendLote } = await import('../sender');

      mockLoteData = null;

      const result = await retrySendLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('não encontrado');
    });

    it('should only allow retry for error status', async () => {
      const { retrySendLote } = await import('../sender');

      mockLoteData = {
        status: 'enviado', // Not error
      };

      const result = await retrySendLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Só é possível reenviar lotes com erro');
    });
  });

  describe('parseSoapResponse', () => {
    it('should parse protocol from response', async () => {
      const { sendLote } = await import('../sender');

      mockLoteData = {
        status: 'rascunho',
        xmlContent: '<mensagemTISS>test</mensagemTISS>',
        registroANS: '123456',
        guiaIds: ['g1'],
      };
      mockOperadoraWebService = {
        url: 'https://ws.operadora.com.br/tiss',
        authType: 'certificate',
      };
      mockHttpResponse = {
        statusCode: 200,
        body: '<tiss:numeroProtocolo>ABC123</tiss:numeroProtocolo>',
      };

      const result = await sendLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(true);
      expect(result.protocolo).toBe('ABC123');
    });

    it('should handle unrecognized response format', async () => {
      const { sendLote } = await import('../sender');

      mockLoteData = {
        status: 'rascunho',
        xmlContent: '<mensagemTISS>test</mensagemTISS>',
        registroANS: '123456',
        guiaIds: ['g1'],
      };
      mockOperadoraWebService = {
        url: 'https://ws.operadora.com.br/tiss',
        authType: 'certificate',
      };
      mockHttpResponse = {
        statusCode: 200,
        body: '<random>unrecognized format</random>',
      };

      const result = await sendLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('não reconhecida');
    });
  });
});

describe('sender auth types', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHttpResponse = {
      statusCode: 200,
      body: '<ans:numeroProtocolo>PROT123</ans:numeroProtocolo>',
    };
  });

  it('should use basic auth when configured', async () => {
    const { sendLote } = await import('../sender');

    mockLoteData = {
      status: 'rascunho',
      xmlContent: '<mensagemTISS>test</mensagemTISS>',
      registroANS: '123456',
      guiaIds: ['g1'],
    };
    mockOperadoraWebService = {
      url: 'https://ws.operadora.com.br/tiss',
      authType: 'basic',
      username: 'testuser',
      password: 'testpass',
    };

    const result = await sendLote(
      { clinicId: 'test', loteId: 'lote-1' },
      { auth: { uid: 'user-1' } } as any
    );

    expect(result.success).toBe(true);
  });

  it('should use token auth when configured', async () => {
    const { sendLote } = await import('../sender');

    mockLoteData = {
      status: 'rascunho',
      xmlContent: '<mensagemTISS>test</mensagemTISS>',
      registroANS: '123456',
      guiaIds: ['g1'],
    };
    mockOperadoraWebService = {
      url: 'https://ws.operadora.com.br/tiss',
      authType: 'token',
      token: 'bearer-token-123',
    };

    const result = await sendLote(
      { clinicId: 'test', loteId: 'lote-1' },
      { auth: { uid: 'user-1' } } as any
    );

    expect(result.success).toBe(true);
  });
});
