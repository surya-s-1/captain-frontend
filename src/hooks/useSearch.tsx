import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface SearchItem extends Record<string, any> { }

interface ExpandingSearchBarProps {
    searchText: string
    onSearchTextChange: (text: string) => void
    onClear: () => void
    placeholder?: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
    keepExpanded?: boolean
}

interface SearchSuggestionsProps<T extends SearchItem> {
    searchResults: T[]
    onSelectSuggestion: (item: T) => void
    maxSuggestions?: number
    className?: string
    renderSuggestion?: (item: T) => React.ReactNode
}

export function useSearch<T extends SearchItem>(
    items: T[],
    searchText: string
): { searchResults: T[] } {
    const searchResults = useMemo(() => {
        if (!searchText || searchText.trim() === '') {
            return items
        }

        const lowerCaseSearchText = searchText.toLowerCase().trim()

        return items.filter(item => {
            return Object.values(item).some(value => {
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(lowerCaseSearchText)
                }
                return false
            })
        })
    }, [items, searchText])

    return { searchResults }
}

const sizeMap = {
    sm: {
        iconSize: 'h-5 w-5',
        padding: 'p-1.5',
        inputClass: 'text-xs pl-1 pr-3 w-60',
        shadow: 'shadow-sm hover:shadow-md',
    },
    md: {
        iconSize: 'h-6 w-6',
        padding: 'p-2',
        inputClass: 'text-sm pl-1 pr-4 w-80',
        shadow: 'shadow-md hover:shadow-lg',
    },
    lg: {
        iconSize: 'h-8 w-8',
        padding: 'p-3',
        inputClass: 'text-base pl-2 pr-6 w-100',
        shadow: 'shadow-lg hover:shadow-xl',
    },
}

export function ExpandingSearchBar({
    searchText,
    onSearchTextChange,
    onClear,
    placeholder = 'Search...',
    size = 'md',
    className = '',
    keepExpanded = false,
}: ExpandingSearchBarProps) {
    const [isHovered, setIsHovered] = useState(false)

    const expand = isHovered || keepExpanded || searchText.length > 0

    const { iconSize, padding, inputClass, shadow } = sizeMap[size]

    const widthClass = 'w-fit'
    const iconMarginClass = expand ? '' : 'm-auto'

    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (expand && inputRef.current) {
            inputRef.current.focus()
        }
    }, [expand])

    return (
        <div
            className={`
                flex items-center rounded-full border border-gray-300 ${shadow} transform 
                transition-[width,padding,shadow] duration-300 ease-in-out bg-white text-gray-800 
                ${widthClass} ${padding} ${className}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {!searchText &&
                <Search className={`${iconSize} transition-all duration-300 flex-shrink-0 ${iconMarginClass}`} />}
            {expand && (
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={searchText}
                    onChange={(e) => onSearchTextChange(e.target.value)}
                    className={`
                        ${inputClass} bg-transparent outline-none transition-opacity duration-300
                    `}
                />
            )}
            {searchText &&
                <div
                    className={`${iconSize} transition-all duration-300 flex-shrink-0 ${iconMarginClass} cursor-pointer`}
                    onClick={() => onClear()}
                >
                    <X />
                </div>}
        </div>
    )
}

const getDisplayValue = (item: SearchItem): string => {
    const value = Object.values(item).find(v => typeof v === 'string' && v.length > 0)
    return value ? String(value) : 'Untitled Item'
}

export function SearchSuggestions<T extends SearchItem>({
    searchResults,
    onSelectSuggestion,
    maxSuggestions = 100,
    className = '',
    renderSuggestion,
}: SearchSuggestionsProps<T>) {
    const suggestionsToDisplay = searchResults.slice(0, maxSuggestions)

    return (
        <div className={`
            bg-white border border-gray-300 rounded-lg shadow-xl mt-1 overflow-hidden 
            max-h-80 overflow-y-auto ${className} scrollbar
        `}>
            {suggestionsToDisplay.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">No matching results found.</div>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {suggestionsToDisplay.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => onSelectSuggestion(item)}
                            className="p-3 text-sm cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                        >
                            {renderSuggestion ? renderSuggestion(item) : (
                                <span className="font-medium">
                                    {getDisplayValue(item)}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}