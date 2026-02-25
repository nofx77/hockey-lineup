import { createI18n } from 'vue-i18n'
import fr from './fr.js'
import en from './en.js'

const LANG_KEY = 'hockey-lineup-lang'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem(LANG_KEY) || 'fr',
  fallbackLocale: 'fr',
  messages: { fr, en },
})

export { LANG_KEY }
export default i18n
