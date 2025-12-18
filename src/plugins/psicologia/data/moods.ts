/**
 * Mood Options - Estados Emocionais
 * ==================================
 *
 * Escala simplificada de humor para registro em sessões de psicologia.
 * Baseada em escalas clínicas validadas, adaptada para UX.
 */

export interface MoodOption {
  id: string;
  label: string;
  icon: string;
}

export const MOODS: MoodOption[] = [
  { id: 'happy', label: 'Feliz', icon: '😊' },
  { id: 'neutral', label: 'Neutro', icon: '😐' },
  { id: 'anxious', label: 'Ansioso', icon: '😰' },
  { id: 'sad', label: 'Triste', icon: '😢' },
] as const;

export type MoodId = (typeof MOODS)[number]['id'];
