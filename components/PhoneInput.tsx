'use client'

import { useState, useEffect, useRef } from 'react'
import { Country } from 'country-state-city'
import { ChevronDown, Phone } from 'lucide-react'

interface PhoneInputProps {
  value: string
  onChange: (phone: string, countryCode: string, fullNumber: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: string
  showLabel?: boolean
  required?: boolean
  allowedCountries?: string[] // ISO country codes
}

// Country calling codes mapping (common ones)
const countryCallingCodes: Record<string, string> = {
  'US': '+1', 'GB': '+44', 'DE': '+49', 'FR': '+33', 'IT': '+39', 'ES': '+34',
  'NL': '+31', 'SE': '+46', 'PL': '+48', 'PT': '+351', 'IE': '+353', 'FI': '+358',
  'CH': '+41', 'GR': '+30', 'HR': '+385', 'MT': '+356', 'AT': '+43',
  'CN': '+86', 'IN': '+91', 'JP': '+81', 'KR': '+82', 'ID': '+62', 'QA': '+974',
  'KW': '+965', 'OM': '+968', 'IQ': '+964', 'LK': '+94', 'NP': '+977',
  'AE': '+971', 'SA': '+966', 'BH': '+973', 'PK': '+92', 'BD': '+880',
  'MY': '+60', 'SG': '+65', 'TH': '+66', 'VN': '+84', 'PH': '+63',
  'AU': '+61', 'NZ': '+64', 'CA': '+1', 'MX': '+52', 'BR': '+55',
  'AR': '+54', 'CL': '+56', 'CO': '+57', 'PE': '+51', 'ZA': '+27',
  'EG': '+20', 'NG': '+234', 'KE': '+254', 'GH': '+233', 'TR': '+90',
  'RU': '+7', 'UA': '+380', 'IL': '+972', 'JO': '+962', 'LB': '+961'
}

export default function PhoneInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  error,
  showLabel = true,
  required = false,
  allowedCountries
}: PhoneInputProps) {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('US')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [isValid, setIsValid] = useState<boolean>(true)
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get allowed countries or use all countries
  const allCountries = Country.getAllCountries()
  const countries = allowedCountries 
    ? allCountries.filter(country => allowedCountries.includes(country.isoCode))
    : allCountries

  // Initialize phone number from value prop
  useEffect(() => {
    if (value) {
      // Try to extract country code and phone number from value
      const match = value.match(/^(\+\d{1,4})\s*(.*)$/)
      if (match) {
        const code = match[1]
        const number = match[2].replace(/\D/g, '')
        // Find country by calling code
        const country = countries.find(c => countryCallingCodes[c.isoCode] === code)
        if (country) {
          setSelectedCountryCode(country.isoCode)
          setPhoneNumber(number)
        } else {
          // If no match, use default country
          setPhoneNumber(value.replace(/\D/g, ''))
        }
      } else {
        // If no country code, use default country
        setPhoneNumber(value.replace(/\D/g, ''))
      }
    }
  }, [value, countries])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Validate phone number format
  const validatePhoneNumber = (countryCode: string, number: string): boolean => {
    if (!number) return true // Empty is valid (optional field)
    
    const digits = number.replace(/\D/g, '')
    
    // Country-specific rules: No leading 0 for countries with specific codes
    const noLeadingZeroCountries = ['DE', 'IT', 'FR', 'ES', 'NL', 'GB', 'IN', 'AT', 'CH', 'BE', 'PT', 'GR', 'SE', 'NO', 'DK', 'FI', 'PL', 'IE', 'CZ', 'HU', 'RO']
    if (noLeadingZeroCountries.includes(countryCode) && digits.startsWith('0')) {
      return false // Invalid if starts with 0
    }
    
    // Basic validation rules based on country
    const minLength: Record<string, number> = {
      'US': 10, 'CA': 10, 'GB': 10, 'DE': 10, 'FR': 9, 'IT': 9, 'ES': 9,
      'IN': 10, 'CN': 11, 'JP': 10, 'KR': 10, 'AU': 9, 'NZ': 8,
      'MX': 10, 'BR': 10, 'RU': 10, 'ZA': 9, 'EG': 10,
      'NL': 9, 'AT': 10, 'CH': 9, 'BE': 9, 'PT': 9, 'GR': 10,
      'SE': 9, 'NO': 8, 'DK': 8, 'FI': 9, 'PL': 9, 'IE': 9
    }

    const maxLength: Record<string, number> = {
      'US': 10, 'CA': 10, 'GB': 10, 'DE': 11, 'FR': 9, 'IT': 10, 'ES': 9,
      'IN': 10, 'CN': 11, 'JP': 11, 'KR': 11, 'AU': 9, 'NZ': 8,
      'MX': 10, 'BR': 11, 'RU': 10, 'ZA': 9, 'EG': 10,
      'NL': 9, 'AT': 13, 'CH': 9, 'BE': 9, 'PT': 9, 'GR': 10,
      'SE': 9, 'NO': 8, 'DK': 8, 'FI': 10, 'PL': 9, 'IE': 9
    }

    const min = minLength[countryCode] || 7
    const max = maxLength[countryCode] || 15

    return digits.length >= min && digits.length <= max
  }

  // Format phone number based on country
  const formatPhoneNumber = (countryCode: string, number: string): string => {
    const digits = number.replace(/\D/g, '')
    
    if (!digits) return ''

    // Country-specific formatting
    if (countryCode === 'US' || countryCode === 'CA') {
      if (digits.length <= 3) return digits
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }
    
    if (countryCode === 'GB') {
      if (digits.length <= 4) return digits
      if (digits.length <= 6) return `${digits.slice(0, 4)} ${digits.slice(4)}`
      if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`
    }

    if (countryCode === 'IN') {
      if (digits.length <= 5) return digits
      return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`
    }

    // Default formatting: groups of 3-4 digits
    if (digits.length <= 4) return digits
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`
    if (digits.length <= 10) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)} ${digits.slice(10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    let digits = input.replace(/\D/g, '')
    
    // Country-specific validation rules
    // Germany (+49): Remove leading 0 if present (country code already includes it)
    if (selectedCountryCode === 'DE' && digits.startsWith('0')) {
      digits = digits.slice(1) // Remove leading 0
    }
    
    // Italy (+39): Remove leading 0 if present
    if (selectedCountryCode === 'IT' && digits.startsWith('0')) {
      digits = digits.slice(1)
    }
    
    // France (+33): Remove leading 0 if present
    if (selectedCountryCode === 'FR' && digits.startsWith('0')) {
      digits = digits.slice(1)
    }
    
    // Spain (+34): Remove leading 0 if present
    if (selectedCountryCode === 'ES' && digits.startsWith('0')) {
      digits = digits.slice(1)
    }
    
    // Netherlands (+31): Remove leading 0 if present
    if (selectedCountryCode === 'NL' && digits.startsWith('0')) {
      digits = digits.slice(1)
    }
    
    // United Kingdom (+44): Remove leading 0 if present
    if (selectedCountryCode === 'GB' && digits.startsWith('0')) {
      digits = digits.slice(1)
    }
    
    // India (+91): Remove leading 0 if present
    if (selectedCountryCode === 'IN' && digits.startsWith('0')) {
      digits = digits.slice(1)
    }
    
    // Limit to reasonable length
    const maxDigits = 15
    const limitedDigits = digits.slice(0, maxDigits)
    
    const formatted = formatPhoneNumber(selectedCountryCode, limitedDigits)
    setPhoneNumber(limitedDigits)
    
    const valid = validatePhoneNumber(selectedCountryCode, limitedDigits)
    setIsValid(valid)
    
    // Combine country code + number
    const callingCode = countryCallingCodes[selectedCountryCode] || '+1'
    const fullNumber = callingCode + (limitedDigits ? ' ' + formatted : '')
    
    onChange(fullNumber, selectedCountryCode, callingCode + limitedDigits)
  }

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountryCode(countryCode)
    const valid = validatePhoneNumber(countryCode, phoneNumber)
    setIsValid(valid)
    
    // Update parent with new country code
    const callingCode = countryCallingCodes[countryCode] || '+1'
    const formatted = formatPhoneNumber(countryCode, phoneNumber)
    const fullNumber = callingCode + (phoneNumber ? ' ' + formatted : '')
    onChange(fullNumber, countryCode, callingCode + phoneNumber)
  }

  const selectedCountry = countries.find(c => c.isoCode === selectedCountryCode) || countries[0]
  const callingCode = countryCallingCodes[selectedCountryCode] || '+1'

  return (
    <div className={className}>
      {showLabel && (
        <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Phone Number
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="flex gap-2">
        {/* Country Code Dropdown */}
        <div className="relative flex-shrink-0">
          <div
            ref={dropdownRef}
            className="relative"
          >
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                if (!disabled) {
                  setIsDropdownOpen(!isDropdownOpen)
                }
              }}
              className="flex items-center gap-2 px-3 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 transition-all hover:border-slate-300 min-w-[100px]"
            >
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">{callingCode}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-1 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto w-64"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search country..."
                    className="w-full px-3 py-2 mb-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    onKeyDown={(e) => e.stopPropagation()}
                    autoFocus
                    onChange={(e) => {
                      // Filter countries by search
                      const search = e.target.value.toLowerCase()
                      const items = document.querySelectorAll(`[data-country-item]`)
                      items.forEach(item => {
                        const text = item.textContent?.toLowerCase() || ''
                        const element = item as HTMLElement
                        element.style.display = text.includes(search) ? 'flex' : 'none'
                      })
                    }}
                  />
                  {countries.map((country) => {
                    const code = countryCallingCodes[country.isoCode]
                    if (!code) return null
                    
                    return (
                      <button
                        key={country.isoCode}
                        type="button"
                        data-country-item
                        onClick={() => {
                          handleCountryChange(country.isoCode)
                          setIsDropdownOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 transition-colors ${
                          selectedCountryCode === country.isoCode ? 'bg-teal-100 font-semibold' : ''
                        }`}
                      >
                        <span className="text-lg">{country.flag}</span>
                        <span className="flex-1 text-left text-sm">{country.name}</span>
                        <span className="text-xs text-slate-600">{code}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="tel"
            value={formatPhoneNumber(selectedCountryCode, phoneNumber)}
            onChange={handlePhoneChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            required={required}
            className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 transition-all hover:border-slate-300 ${
              error || (!isValid && phoneNumber) 
                ? 'border-red-300 focus:ring-red-500' 
                : isFocused 
                  ? 'border-teal-300' 
                  : 'border-slate-200'
            }`}
            placeholder={placeholder || `Enter phone number`}
          />
        </div>
      </div>

      {/* Error Message */}
      {(error || (!isValid && phoneNumber)) && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <span>⚠️</span>
          {error || (
            phoneNumber.startsWith('0') && ['DE', 'IT', 'FR', 'ES', 'NL', 'GB', 'IN'].includes(selectedCountryCode)
              ? `Phone numbers with country code ${callingCode} should not start with 0`
              : `Please enter a valid ${selectedCountry.name} phone number`
          )}
        </p>
      )}

      {/* Helper Text */}
      {!error && isValid && !isFocused && (
        <p className="text-xs text-slate-500 mt-1">
          Country: {selectedCountry.name} ({callingCode})
        </p>
      )}
    </div>
  )
}

