export type Tone = 'morning' | 'day' | 'dusk' | 'night'
export type TonePreference = 'auto' | Tone

export const getToneForHour = (hour: number): Tone => {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'day'
  if (hour >= 18 && hour < 21) return 'dusk'
  return 'night'
}

export const resolveTone = (preference: TonePreference, date = new Date()): Tone =>
  preference === 'auto' ? getToneForHour(date.getHours()) : preference
