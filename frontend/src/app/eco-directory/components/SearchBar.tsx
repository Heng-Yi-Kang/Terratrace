"use client"

import { FormEvent, useEffect, useState } from 'react'

type SearchBarProps = {
    value?: string
    onChange?: (value: string) => void
    onSubmit?: (value: string) => void
    placeholder?: string
    className?: string
    debounceMs?: number
}

const SearchIcon = () => (
    <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="h-8 w-8"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.04 6.04a7.5 7.5 0 0 0 10.61 10.61Z"
        />
    </svg>
)

const ClearIcon = () => (
    <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-4 w-4"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
)

export default function SearchBar({
    value = '',
    onChange,
    onSubmit,
    placeholder = 'Search by name, city, or category',
    className = '',
    debounceMs = 300,
}: SearchBarProps) {
    const [query, setQuery] = useState(value)

    useEffect(() => {
        setQuery(value)
    }, [value])

    useEffect(() => {
        if (!onChange) return

        const timeout = window.setTimeout(() => {
            onChange(query.trim())
        }, debounceMs)

        return () => window.clearTimeout(timeout)
    }, [query, debounceMs, onChange])

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        onSubmit?.(query.trim())
    }

    const handleClear = () => {
        setQuery('')
        onSubmit?.('')
        onChange?.('')
    }

    return (
        <form onSubmit={handleSubmit} className={`w-full ${className}`} role="search" aria-label="Eco directory search">
            <label htmlFor="eco-directory-search" className="sr-only">
                Search eco directory
            </label>

            <div className="flex w-full items-center gap-2 rounded-full border border-primary/30 bg-white px-5 py-4 shadow-sm transition-all duration-200 motion-reduce:transition-none focus-within:border-[#0891B2] focus-within:ring-2 focus-within:ring-[#22D3EE]/40">
                <span className="text-[#164E63]/70" aria-hidden="true">
                    <SearchIcon />
                </span>

                <input
                    id="eco-directory-search"
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="flex-1 min-w-0 bg-transparent font-heading text-lg text-[#164E63] placeholder:text-[#164E63]/55 outline-none"
                />

                {query.length > 0 && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-[#164E63]/70 transition-colors duration-200 motion-reduce:transition-none hover:bg-[#ECFEFF] hover:text-[#164E63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]"
                        aria-label="Clear search"
                    >
                        <ClearIcon />
                    </button>
                )}

                <button
                    type="submit"
                    className="flex-shrink-0 inline-flex cursor-pointer items-center justify-center rounded-full bg-secondary px-5 py-3 text-base font-bold font-heading text-white transition-all duration-300 motion-reduce:transition-none hover:bg-[#5de990] hover:scale-110 hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE] pointer-events-auto"
                >
                    Search
                </button>
            </div>
        </form>
    )
}