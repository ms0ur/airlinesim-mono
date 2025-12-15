// Globe color palette - uses CSS variables from main.css

export const globePalette = {
  light: {
    ocean: '#F3F4F6',      // --background
    surface: '#FFFFFF',     // --surface
    border: '#D1D5DB',      // slightly darker than --border for visibility
    primary: '#1D4ED8',     // --primary (brand-700)
    text: '#0F172A',        // --text-primary
    textMuted: '#4B5563',   // --text-muted
  },
  dark: {
    ocean: '#0F1324',       // --surface dark
    surface: '#1E293B',     // slightly lighter for land
    border: '#374151',      // darker border
    primary: '#60A5FA',     // --primary dark (brand-400)
    text: '#F9FAFB',        // --text-primary dark
    textMuted: '#9CA3AF',   // --text-muted dark
  }
} as const

export type GlobePaletteTheme = keyof typeof globePalette
