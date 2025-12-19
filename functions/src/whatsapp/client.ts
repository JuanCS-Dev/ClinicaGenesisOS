/**
 * WhatsApp Cloud API Client
 *
 * Simple, focused client for sending template messages.
 * MVP: Uses shared credentials from environment.
 * Production: Uses clinic-specific credentials from Firestore.
 */

import { getWhatsAppConfig } from '../utils/config.js';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';

/** Response from WhatsApp API when sending a message. */
export interface WhatsAppMessageResponse {
  messaging_product: 'whatsapp';
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

/** Error response from WhatsApp API. */
export interface WhatsAppErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

/** Template parameter for WhatsApp messages. */
export interface TemplateParameter {
  type: 'text';
  text: string;
}

/** Template component for WhatsApp messages. */
export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters?: TemplateParameter[];
  sub_type?: 'quick_reply';
  index?: number;
}

/**
 * Send a template message via WhatsApp Cloud API.
 *
 * @param to - Phone number in international format (e.g., 5511999999999)
 * @param templateName - Name of the approved template
 * @param languageCode - Language code (e.g., pt_BR)
 * @param components - Template components with parameters
 * @param clinicId - Clinic ID for multi-tenant (optional in MVP)
 * @returns Message ID if successful
 * @throws Error if API call fails
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string,
  components: TemplateComponent[],
  clinicId?: string
): Promise<string> {
  const config = await getWhatsAppConfig(clinicId);

  const response = await fetch(
    `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizePhone(to),
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = data as WhatsAppErrorResponse;
    throw new Error(
      `WhatsApp API error: ${error.error.message} (code: ${error.error.code})`
    );
  }

  const result = data as WhatsAppMessageResponse;
  return result.messages[0].id;
}

/**
 * Send a text message within the 24h customer service window.
 * FREE - no template needed if customer messaged us first.
 */
export async function sendTextMessage(
  to: string,
  text: string,
  clinicId?: string
): Promise<string> {
  const config = await getWhatsAppConfig(clinicId);

  const response = await fetch(
    `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizePhone(to),
        type: 'text',
        text: { body: text },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = data as WhatsAppErrorResponse;
    throw new Error(
      `WhatsApp API error: ${error.error.message} (code: ${error.error.code})`
    );
  }

  const result = data as WhatsAppMessageResponse;
  return result.messages[0].id;
}

/**
 * Mark a message as read (sends blue checkmarks).
 */
export async function markAsRead(
  messageId: string,
  clinicId?: string
): Promise<void> {
  const config = await getWhatsAppConfig(clinicId);

  await fetch(`${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  });
}

/**
 * Normalize phone number to WhatsApp format.
 * Removes all non-digits and ensures country code.
 */
function normalizePhone(phone: string): string {
  // Remove everything except digits
  let normalized = phone.replace(/\D/g, '');

  // Add Brazil country code if not present
  if (normalized.length === 11 || normalized.length === 10) {
    normalized = '55' + normalized;
  }

  return normalized;
}
