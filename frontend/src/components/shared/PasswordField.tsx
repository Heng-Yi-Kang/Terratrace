'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordFieldProps {
  id?: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  labelClassName?: string
  inputClassName?: string
}

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  labelClassName = 'block text-sm font-medium text-text mb-2',
  inputClassName = 'w-full px-4 py-3 rounded-xl border border-text/20 bg-white/80 text-text placeholder-text/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200',
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div>
      <label htmlFor={inputId} className={labelClassName}>
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClassName} pr-12`}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? 'Hide value' : 'Show value'}
          aria-pressed={isVisible}
          className="absolute inset-y-0 right-3 flex h-full w-8 items-center justify-center text-text/50 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          {isVisible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
        </button>
      </div>
    </div>
  )
}
