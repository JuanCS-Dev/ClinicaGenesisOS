/**
 * PIX Service - Direct QR Code Generation
 * ========================================
 *
 * Generates PIX QR codes directly using clinic's PIX key.
 * No payment gateway required - 0% fees!
 *
 * Based on Banco Central BR Code specification (EMV QR Code).
 *
 * @see https://www.bcb.gov.br/estabilidadefinanceira/pix
 */

import QRCode from 'qrcode';

/**
 * PIX key types supported by Banco Central.
 */
export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

/**
 * Input for generating a direct PIX QR code.
 */
export interface DirectPixInput {
  /** Receiver's PIX key */
  pixKey: string;
  /** PIX key type */
  pixKeyType: PixKeyType;
  /** Receiver name (max 25 chars) */
  receiverName: string;
  /** Receiver city (max 15 chars) */
  receiverCity: string;
  /** Amount in BRL (optional - if not set, payer enters amount) */
  amount?: number;
  /** Transaction ID (max 25 chars, alphanumeric) */
  transactionId?: string;
  /** Description (max 72 chars) */
  description?: string;
}

/**
 * Generated PIX QR code data.
 */
export interface DirectPixResult {
  /** QR code as data URL (base64 PNG) */
  qrCodeDataUrl: string;
  /** PIX Copia e Cola string */
  pixCopiaECola: string;
  /** Expiration (if set) */
  expiresAt?: string;
}

/**
 * EMV QR Code field IDs for PIX.
 */
const EMV_FIELDS = {
  PAYLOAD_FORMAT: '00',
  MERCHANT_ACCOUNT_INFO: '26',
  MERCHANT_ACCOUNT_GUI: '00',
  MERCHANT_ACCOUNT_KEY: '01',
  MERCHANT_ACCOUNT_DESC: '02',
  MERCHANT_CATEGORY: '52',
  TRANSACTION_CURRENCY: '53',
  TRANSACTION_AMOUNT: '54',
  COUNTRY_CODE: '58',
  MERCHANT_NAME: '59',
  MERCHANT_CITY: '60',
  ADDITIONAL_DATA: '62',
  ADDITIONAL_TXID: '05',
  CRC16: '63',
} as const;

/**
 * Formats a field value with ID and length prefix.
 */
function formatField(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

/**
 * Calculates CRC16-CCITT checksum for PIX payload.
 */
function calculateCRC16(payload: string): string {
  const data = payload + EMV_FIELDS.CRC16 + '04';
  let crc = 0xffff;

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }

  crc &= 0xffff;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Sanitizes string for PIX (removes accents and special chars).
 */
function sanitizePixString(str: string, maxLength: number): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .substring(0, maxLength)
    .toUpperCase();
}

/**
 * Generates PIX Copia e Cola string (BR Code payload).
 */
export function generatePixPayload(input: DirectPixInput): string {
  // Validate and sanitize inputs
  const receiverName = sanitizePixString(input.receiverName, 25);
  const receiverCity = sanitizePixString(input.receiverCity, 15);
  const transactionId = input.transactionId
    ? sanitizePixString(input.transactionId, 25)
    : '***'; // Dynamic transaction ID

  // Build Merchant Account Information (field 26)
  const merchantAccountGUI = formatField(
    EMV_FIELDS.MERCHANT_ACCOUNT_GUI,
    'br.gov.bcb.pix'
  );
  const merchantAccountKey = formatField(
    EMV_FIELDS.MERCHANT_ACCOUNT_KEY,
    input.pixKey
  );

  let merchantAccountInfo = merchantAccountGUI + merchantAccountKey;

  // Add description if provided
  if (input.description) {
    const desc = sanitizePixString(input.description, 72);
    merchantAccountInfo += formatField(EMV_FIELDS.MERCHANT_ACCOUNT_DESC, desc);
  }

  // Build payload
  let payload = '';

  // Payload Format Indicator (always "01")
  payload += formatField(EMV_FIELDS.PAYLOAD_FORMAT, '01');

  // Merchant Account Information
  payload += formatField(EMV_FIELDS.MERCHANT_ACCOUNT_INFO, merchantAccountInfo);

  // Merchant Category Code (0000 = not specified)
  payload += formatField(EMV_FIELDS.MERCHANT_CATEGORY, '0000');

  // Transaction Currency (986 = BRL)
  payload += formatField(EMV_FIELDS.TRANSACTION_CURRENCY, '986');

  // Transaction Amount (optional)
  if (input.amount && input.amount > 0) {
    const amountStr = input.amount.toFixed(2);
    payload += formatField(EMV_FIELDS.TRANSACTION_AMOUNT, amountStr);
  }

  // Country Code
  payload += formatField(EMV_FIELDS.COUNTRY_CODE, 'BR');

  // Merchant Name
  payload += formatField(EMV_FIELDS.MERCHANT_NAME, receiverName);

  // Merchant City
  payload += formatField(EMV_FIELDS.MERCHANT_CITY, receiverCity);

  // Additional Data Field (transaction ID)
  const additionalData = formatField(EMV_FIELDS.ADDITIONAL_TXID, transactionId);
  payload += formatField(EMV_FIELDS.ADDITIONAL_DATA, additionalData);

  // Calculate and append CRC16
  const crc = calculateCRC16(payload);
  payload += EMV_FIELDS.CRC16 + '04' + crc;

  return payload;
}

/**
 * Generates a complete PIX QR code with image.
 */
export async function generateDirectPixQRCode(
  input: DirectPixInput
): Promise<DirectPixResult> {
  // Generate PIX payload
  const pixCopiaECola = generatePixPayload(input);

  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(pixCopiaECola, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  return {
    qrCodeDataUrl,
    pixCopiaECola,
  };
}

/**
 * Validates a PIX key format.
 */
export function validatePixKey(
  key: string,
  type: PixKeyType
): { valid: boolean; error?: string } {
  switch (type) {
    case 'cpf':
      // CPF: 11 digits
      if (!/^\d{11}$/.test(key.replace(/\D/g, ''))) {
        return { valid: false, error: 'CPF deve ter 11 dígitos' };
      }
      break;

    case 'cnpj':
      // CNPJ: 14 digits
      if (!/^\d{14}$/.test(key.replace(/\D/g, ''))) {
        return { valid: false, error: 'CNPJ deve ter 14 dígitos' };
      }
      break;

    case 'email':
      // Email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) {
        return { valid: false, error: 'Email inválido' };
      }
      break;

    case 'phone':
      // Phone: +55 + DDD + number
      if (!/^\+55\d{10,11}$/.test(key.replace(/\D/g, '').replace(/^/, '+55'))) {
        return { valid: false, error: 'Telefone deve ter DDD + número' };
      }
      break;

    case 'random':
      // Random key: 32 hex chars with dashes
      if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(key)) {
        return { valid: false, error: 'Chave aleatória inválida' };
      }
      break;
  }

  return { valid: true };
}

/**
 * Detects PIX key type from input.
 */
export function detectPixKeyType(key: string): PixKeyType | null {
  const cleanKey = key.trim();

  // Random key (UUID format)
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(cleanKey)) {
    return 'random';
  }

  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanKey)) {
    return 'email';
  }

  // Phone (starts with +55 or has 10-11 digits)
  if (/^\+55\d{10,11}$/.test(cleanKey) || /^\d{10,11}$/.test(cleanKey.replace(/\D/g, ''))) {
    return 'phone';
  }

  // CPF (11 digits)
  const digits = cleanKey.replace(/\D/g, '');
  if (digits.length === 11) {
    return 'cpf';
  }

  // CNPJ (14 digits)
  if (digits.length === 14) {
    return 'cnpj';
  }

  return null;
}

/**
 * Formats amount from cents to BRL.
 */
export function formatPixAmount(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

