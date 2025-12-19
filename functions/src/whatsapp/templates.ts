/**
 * WhatsApp Message Templates
 *
 * Templates must be approved by Meta before use.
 * Submit at: https://business.facebook.com/wa/manage/message-templates/
 *
 * TEMPLATE NAMES (to submit for approval):
 * - appointment_reminder_24h
 * - appointment_reminder_2h
 * - appointment_confirmation
 */

import {
  sendTemplateMessage,
  sendTextMessage,
  type TemplateComponent,
} from './client.js';

/** Appointment data needed for reminders. */
export interface AppointmentData {
  patientName: string;
  patientPhone: string;
  date: string; // Formatted date (e.g., "20/12/2025")
  time: string; // Formatted time (e.g., "14:30")
  professionalName: string;
  clinicName: string;
  clinicAddress?: string;
}

/**
 * Template: appointment_reminder_24h
 *
 * Submit this template to Meta for approval:
 * -------------------------------------------
 * Olá {{1}}! 👋
 *
 * Lembrete: Sua consulta está agendada para *amanhã*.
 *
 * 📅 *Data*: {{2}}
 * ⏰ *Horário*: {{3}}
 * 👨‍⚕️ *Profissional*: {{4}}
 * 📍 *Local*: {{5}}
 *
 * Você confirma sua presença?
 *
 * Buttons: [Confirmar ✅] [Remarcar 📅]
 * -------------------------------------------
 */
export const TEMPLATE_REMINDER_24H = 'consulta_lembrete_24h';

/**
 * Template: appointment_reminder_2h
 *
 * Submit this template to Meta for approval:
 * -------------------------------------------
 * {{1}}, sua consulta é em *2 horas*! ⏰
 *
 * 📍 {{2}}
 * ⏰ {{3}}
 *
 * Estamos te esperando! 😊
 * -------------------------------------------
 */
export const TEMPLATE_REMINDER_2H = 'consulta_lembrete_2h';

/**
 * Template: appointment_confirmation
 *
 * Submit this template to Meta for approval:
 * -------------------------------------------
 * Olá {{1}}! ✅
 *
 * Sua consulta foi agendada com sucesso!
 *
 * 📅 *Data*: {{2}}
 * ⏰ *Horário*: {{3}}
 * 👨‍⚕️ *Profissional*: {{4}}
 *
 * Enviaremos um lembrete 24h antes.
 * Responda esta mensagem se precisar de algo!
 * -------------------------------------------
 */
export const TEMPLATE_CONFIRMATION = 'consulta_confirmacao';

/**
 * Send 24h reminder with confirmation buttons.
 * This is a PAID template message.
 */
export async function sendReminder24h(
  appointment: AppointmentData,
  clinicId?: string
): Promise<string> {
  const components: TemplateComponent[] = [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: appointment.patientName },
        { type: 'text', text: appointment.date },
        { type: 'text', text: appointment.time },
        { type: 'text', text: appointment.professionalName },
        { type: 'text', text: appointment.clinicAddress || appointment.clinicName },
      ],
    },
  ];

  return sendTemplateMessage(
    appointment.patientPhone,
    TEMPLATE_REMINDER_24H,
    'pt_BR',
    components,
    clinicId
  );
}

/**
 * Send 2h reminder.
 * If patient responded to 24h reminder, this can be FREE (within 24h window).
 * Otherwise, it's a PAID template message.
 */
export async function sendReminder2h(
  appointment: AppointmentData,
  useTemplate: boolean,
  clinicId?: string
): Promise<string> {
  // If within 24h window (patient responded), send FREE text
  if (!useTemplate) {
    const text = `${appointment.patientName}, sua consulta é em *2 horas*! ⏰\n\n📍 ${appointment.clinicAddress || appointment.clinicName}\n⏰ ${appointment.time}\n\nEstamos te esperando! 😊`;
    return sendTextMessage(appointment.patientPhone, text, clinicId);
  }

  // Otherwise, send PAID template
  const components: TemplateComponent[] = [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: appointment.patientName },
        { type: 'text', text: appointment.clinicAddress || appointment.clinicName },
        { type: 'text', text: appointment.time },
      ],
    },
  ];

  return sendTemplateMessage(
    appointment.patientPhone,
    TEMPLATE_REMINDER_2H,
    'pt_BR',
    components,
    clinicId
  );
}

/**
 * Send appointment confirmation.
 * This opens the 24h window for FREE follow-up messages.
 */
export async function sendAppointmentConfirmation(
  appointment: AppointmentData,
  clinicId?: string
): Promise<string> {
  const components: TemplateComponent[] = [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: appointment.patientName },
        { type: 'text', text: appointment.date },
        { type: 'text', text: appointment.time },
        { type: 'text', text: appointment.professionalName },
      ],
    },
  ];

  return sendTemplateMessage(
    appointment.patientPhone,
    TEMPLATE_CONFIRMATION,
    'pt_BR',
    components,
    clinicId
  );
}

/**
 * Send a free-form message within the 24h window.
 * Use this for follow-ups after patient responds.
 * FREE - no cost.
 */
export async function sendFreeMessage(
  phone: string,
  message: string,
  clinicId?: string
): Promise<string> {
  return sendTextMessage(phone, message, clinicId);
}
