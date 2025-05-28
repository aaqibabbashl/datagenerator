/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cyberpunk Color Palette
        cyber: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        neon: {
          cyan: '#00d4ff',
          pink: '#ff0080',
          green: '#00ff41',
          blue: '#0080ff',
          purple: '#8000ff',
          yellow: '#ffff00',
          orange: '#ff4000',
        },
        matrix: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        dark: {
          50: '#f8f8f8',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#4d4d4d',
          800: '#333333',
          900: '#1a1a1a',
          950: '#0a0a0a',
        },
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
        'fira-code': ['Fira Code', 'monospace'],
        'cyber': ['Orbitron', 'monospace'],
        'matrix': ['Fira Code', 'monospace'],
      },
      animation: {
        // Cyberpunk Animations
        'neonGlow': 'neonGlow 2s ease-in-out infinite alternate',
        'matrixRain': 'matrixRain 3s linear infinite',
        'glitch': 'glitch 0.5s infinite',
        'scanline': 'scanline 4s linear infinite',
        'typewriter': 'typewriter 3s steps(40) infinite',
        'blink': 'blink 1s infinite',
        'circuitPulse': 'circuitPulse 3s ease-in-out infinite',
        'dataFlow': 'dataFlow 2s linear infinite',
        'holographicShift': 'holographicShift 4s ease infinite',
        'borderGlow': 'borderGlow 3s ease-in-out infinite',
        'gradientShift': 'gradientShift 3s ease infinite',
        'gridMove': 'gridMove 20s linear infinite',
        'borderRotate': 'borderRotate 4s linear infinite',
      },
      keyframes: {
        neonGlow: {
          'from': { filter: 'drop-shadow(0 0 5px #00d4ff)' },
          'to': { filter: 'drop-shadow(0 0 20px #00d4ff)' },
        },
        matrixRain: {
          '0%': { transform: 'translateY(-100vh)', opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        glitch: {
          '0%, 14%, 15%, 49%, 50%, 99%, 100%': { transform: 'translate(0)' },
          '15%, 49%': { transform: 'translate(-2px, 2px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        circuitPulse: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.8' },
        },
        dataFlow: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        holographicShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        borderGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        gridMove: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(50px, 50px)' },
        },
        borderRotate: {
          '0%': { 
            background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.9), rgba(22, 33, 62, 0.8)) padding-box, linear-gradient(0deg, #00d4ff, #ff0080, #00ff41, #8000ff) border-box'
          },
          '25%': { 
            background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.9), rgba(22, 33, 62, 0.8)) padding-box, linear-gradient(90deg, #00d4ff, #ff0080, #00ff41, #8000ff) border-box'
          },
          '50%': { 
            background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.9), rgba(22, 33, 62, 0.8)) padding-box, linear-gradient(180deg, #00d4ff, #ff0080, #00ff41, #8000ff) border-box'
          },
          '75%': { 
            background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.9), rgba(22, 33, 62, 0.8)) padding-box, linear-gradient(270deg, #00d4ff, #ff0080, #00ff41, #8000ff) border-box'
          },
          '100%': { 
            background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.9), rgba(22, 33, 62, 0.8)) padding-box, linear-gradient(360deg, #00d4ff, #ff0080, #00ff41, #8000ff) border-box'
          },
        },
      },
      backgroundImage: {
        // Cyberpunk Gradients
        'cyber-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
        'neon-gradient': 'linear-gradient(135deg, #00d4ff, #ff0080, #00ff41)',
        'matrix-gradient': 'linear-gradient(135deg, #001100, #003300, #005500)',
        'holographic': 'linear-gradient(45deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 0, 128, 0.1) 25%, rgba(0, 255, 65, 0.1) 50%, rgba(128, 0, 255, 0.1) 75%, rgba(0, 212, 255, 0.1) 100%)',
        'grid-pattern': 'linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)',
      },
      boxShadow: {
        // Cyberpunk Shadows
        'neon': '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(255, 0, 128, 0.3)',
        'neon-cyan': '0 0 20px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.1)',
        'neon-pink': '0 0 20px rgba(255, 0, 128, 0.3), inset 0 0 20px rgba(255, 0, 128, 0.1)',
        'neon-green': '0 0 20px rgba(0, 255, 65, 0.3), inset 0 0 20px rgba(0, 255, 65, 0.1)',
        'neon-blue': '0 0 20px rgba(0, 128, 255, 0.3), inset 0 0 20px rgba(0, 128, 255, 0.1)',
        'neon-purple': '0 0 20px rgba(128, 0, 255, 0.3), inset 0 0 20px rgba(128, 0, 255, 0.1)',
        'neon-yellow': '0 0 20px rgba(255, 255, 0, 0.3), inset 0 0 20px rgba(255, 255, 0, 0.1)',
      },
      backdropBlur: {
        'cyber': '10px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        // Cyberpunk Utility Classes
        '.gradient-text': {
          background: 'linear-gradient(135deg, #00d4ff, #ff0080, #00ff41)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 3s ease infinite',
        },
        '.cyber-card': {
          background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.9), rgba(22, 33, 62, 0.8))',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          borderRadius: '12px',
          boxShadow: '0 0 30px rgba(0, 212, 255, 0.3), inset 0 0 30px rgba(255, 0, 128, 0.1)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden',
        },
        '.cyber-button': {
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 0, 128, 0.1))',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          color: '#00d4ff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontFamily: 'Orbitron, monospace',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
        },
        '.cyber-button:hover': {
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(255, 0, 128, 0.2))',
          boxShadow: '0 0 30px rgba(0, 212, 255, 0.6), 0 0 60px rgba(255, 0, 128, 0.4)',
          transform: 'translateY(-2px)',
        },
        '.cyber-input': {
          background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.9), rgba(22, 33, 62, 0.8))',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          color: '#00d4ff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontFamily: 'Fira Code, monospace',
          transition: 'all 0.3s ease',
          boxShadow: '0 0 15px rgba(0, 212, 255, 0.2)',
        },
        '.cyber-input:focus': {
          outline: 'none',
          boxShadow: '0 0 25px rgba(255, 0, 128, 0.4), 0 0 50px rgba(0, 212, 255, 0.3)',
        },
        '.cyber-input::placeholder': {
          color: 'rgba(0, 212, 255, 0.5)',
        },
        '.gradient-border-animated': {
          position: 'relative',
          border: '2px solid transparent',
          background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.9), rgba(22, 33, 62, 0.8)) padding-box, linear-gradient(135deg, #00d4ff, #ff0080, #00ff41, #8000ff) border-box',
          animation: 'borderRotate 4s linear infinite',
        },
        '.gradient-line-all': {
          position: 'relative',
        },
        '.gradient-line-all::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'linear-gradient(135deg, #00d4ff, #ff0080, #00ff41, #8000ff)',
          borderRadius: 'inherit',
          padding: '1px',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          zIndex: '-1',
        },
        '.gradient-line-top': {
          borderTop: '2px solid transparent',
          background: 'linear-gradient(to right, #00d4ff, #ff0080) border-box',
          backgroundClip: 'border-box',
        },
        '.gradient-line-bottom': {
          borderBottom: '2px solid transparent',
          background: 'linear-gradient(to right, #ff0080, #00ff41) border-box',
          backgroundClip: 'border-box',
        },
        '.gradient-line-left': {
          borderLeft: '2px solid transparent',
          background: 'linear-gradient(to bottom, #00d4ff, #8000ff) border-box',
          backgroundClip: 'border-box',
        },
        '.gradient-line-right': {
          borderRight: '2px solid transparent',
          background: 'linear-gradient(to bottom, #ff0080, #00ff41) border-box',
          backgroundClip: 'border-box',
        },
        '.matrix-rain': {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: '-1',
          overflow: 'hidden',
        },
        '.holographic': {
          background: 'linear-gradient(45deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 0, 128, 0.1) 25%, rgba(0, 255, 65, 0.1) 50%, rgba(128, 0, 255, 0.1) 75%, rgba(0, 212, 255, 0.1) 100%)',
          backgroundSize: '400% 400%',
          animation: 'holographicShift 4s ease infinite',
        },
        '.glitch': {
          position: 'relative',
          color: '#00d4ff',
        },
        '.glitch::before': {
          content: 'attr(data-text)',
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          animation: 'glitch 0.5s infinite',
          color: '#ff0080',
          zIndex: '-1',
        },
        '.glitch::after': {
          content: 'attr(data-text)',
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          animation: 'glitch 0.5s infinite',
          color: '#00ff41',
          zIndex: '-2',
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
};