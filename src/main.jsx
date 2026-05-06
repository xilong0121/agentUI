import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 深色模式支持
function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('theme') === 'dark' ||
        (!window.localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      root.style.backgroundColor = '#111827'
      root.style.color = '#f3f4f6'
    } else {
      root.classList.remove('dark')
      root.style.backgroundColor = ''
      root.style.color = ''
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return { isDark, setIsDark }
}

const { isDark, setIsDark } = useDarkMode()

// 深色模式切换按钮
function DarkModeToggle() {
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="fixed bottom-4 right-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center z-50"
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <DarkModeToggle />
  </React.StrictMode>,
)
