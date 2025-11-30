'use client'

import { useState, useEffect, useRef } from 'react'
import { Globe, X, ChevronDown } from 'lucide-react'

interface LanguageSelectorProps {
  value: string[] // Array of selected languages
  onChange: (languages: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: string
  showLabel?: boolean
  required?: boolean
}

// Common languages list
const COMMON_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά' },
  { code: 'he', name: 'Hebrew', native: 'עברית' },
  { code: 'fi', name: 'Finnish', native: 'Suomi' },
  { code: 'cs', name: 'Czech', native: 'Čeština' },
  { code: 'hu', name: 'Hungarian', native: 'Magyar' },
  { code: 'ro', name: 'Romanian', native: 'Română' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська' },
  { code: 'no', name: 'Norwegian', native: 'Norsk' },
  { code: 'da', name: 'Danish', native: 'Dansk' },
]

export default function LanguageSelector({
  value = [],
  onChange,
  placeholder = 'Select languages',
  disabled = false,
  className = '',
  error,
  showLabel = true,
  required = false
}: LanguageSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setSearchQuery('')
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Filter languages based on search
  const filteredLanguages = COMMON_LANGUAGES.filter(lang => {
    const search = searchQuery.toLowerCase()
    return (
      lang.name.toLowerCase().includes(search) ||
      lang.native.toLowerCase().includes(search) ||
      lang.code.toLowerCase().includes(search)
    )
  })

  const handleToggleLanguage = (languageCode: string) => {
    if (disabled) return

    const newLanguages = value.includes(languageCode)
      ? value.filter(lang => lang !== languageCode)
      : [...value, languageCode]
    
    onChange(newLanguages)
  }

  const handleRemoveLanguage = (languageCode: string) => {
    if (disabled) return
    onChange(value.filter(lang => lang !== languageCode))
  }

  const getLanguageName = (code: string) => {
    const lang = COMMON_LANGUAGES.find(l => l.code === code)
    return lang ? lang.name : code
  }

  return (
    <div className={className}>
      {showLabel && (
        <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Languages
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Selected Languages Tags */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 p-3 bg-slate-50 border-2 border-slate-200 rounded-xl min-h-[52px]">
            {value.map((langCode) => (
              <span
                key={langCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-100 text-teal-800 text-sm font-medium rounded-lg"
              >
                {getLanguageName(langCode)}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(langCode)}
                    className="hover:bg-teal-200 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${getLanguageName(langCode)}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Dropdown Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsDropdownOpen(!isDropdownOpen)
            }
          }}
          className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 transition-all hover:border-slate-300 flex items-center justify-between ${
            error ? 'border-red-300' : 'border-slate-200'
          }`}
        >
          <span className={value.length > 0 ? 'text-slate-700' : 'text-slate-400'}>
            {value.length > 0 ? `+ Add more languages` : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
            {/* Search Input */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-2 z-10">
              <input
                type="text"
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                autoFocus
              />
            </div>

            {/* Language List */}
            <div className="p-2">
              {filteredLanguages.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-500 text-sm">
                  No languages found
                </div>
              ) : (
                filteredLanguages.map((language) => {
                  const isSelected = value.includes(language.code)
                  return (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => handleToggleLanguage(language.code)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-teal-50 transition-colors ${
                        isSelected ? 'bg-teal-100 font-semibold' : ''
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-sm text-slate-900">{language.name}</span>
                        <span className="text-xs text-slate-500">{language.native}</span>
                      </div>
                      {isSelected && (
                        <span className="text-teal-600 text-xs">✓</span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}

      {/* Helper Text */}
      {!error && value.length === 0 && (
        <p className="text-xs text-slate-500 mt-1">
          Select the languages you speak
        </p>
      )}
    </div>
  )
}

