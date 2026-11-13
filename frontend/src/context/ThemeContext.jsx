import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'catat-uang.theme'
const ThemeContext = createContext(null)

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch (error) {
    // localStorage bisa diblokir; pakai preferensi sistem.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const isDark = theme === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.style.colorScheme = theme

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', isDark ? '#0c1210' : '#f5f2e9')

    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch (error) {
      // Preferensi tetap berlaku untuk sesi ini saja.
    }
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme harus dipakai di dalam ThemeProvider')
  return context
}
