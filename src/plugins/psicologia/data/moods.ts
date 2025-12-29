/**
 * Mood Options - Estados Emocionais
 * ==================================
 *
 * Escala simplificada de humor para registro em sessões de psicologia.
 * Baseada em escalas clínicas validadas, adaptada para UX.
 */

/** Mood identifier matching the EditorRecordData type */
export type MoodId = 'happy' | 'neutral' | 'sad' | 'anxious' | 'angry'

export interface MoodOption {
  id: MoodId
  label: string
  icon: string
}

export const MOODS: readonly MoodOption[] = [
  { id: 'happy', label: 'Feliz', icon: '😊' },
  { id: 'neutral', label: 'Neutro', icon: '😐' },
  { id: 'anxious', label: 'Ansioso', icon: '😰' },
  { id: 'sad', label: 'Triste', icon: '😢' },
  { id: 'angry', label: 'Irritado', icon: '😠' },
]
