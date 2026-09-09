/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'matrix-black': '#030712',
        'clinical-dark': '#060B16',
        'surface-panel': '#0B132B',
        'surface-card': '#0E1A38',
        'surface-border': '#1E293B',
        'telemetry-cyan': '#00F2FE',
        'coherent-blue': '#38BDF8',
        'synaptic-indigo': '#6366F1',
        'synaptic-violet': '#A855F7',
        'alert-crimson': '#EF4444',
        'alert-amber': '#F97316',
        'clinical-green': '#10B981',
      },
      boxShadow: {
        'glow-cyan': '0 0 24px -4px rgba(0, 242, 254, 0.35)',
        'glow-indigo': '0 0 24px -4px rgba(99, 102, 241, 0.35)',
        'glow-crimson': '0 0 24px -4px rgba(239, 68, 68, 0.35)',
        'glow-amber': '0 0 24px -4px rgba(249, 115, 22, 0.35)',
        'precision-border': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 0 0 1px rgba(56, 189, 248, 0.15)',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
