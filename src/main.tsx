import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/i18n'
import App from './App.tsx'
import i18n from './lib/i18n'

// アプリケーション起動時に保存された言語を読み込み
const savedLanguage = localStorage.getItem('app-language') || 'ja';
i18n.changeLanguage(savedLanguage);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
