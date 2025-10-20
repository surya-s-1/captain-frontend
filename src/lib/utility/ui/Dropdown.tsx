import React, { useEffect, useState } from 'react'
import { Loader2, ChevronDown } from 'lucide-react'

interface DropdownOption {
    label: string
    value: string
    color?: string
    disabled?: boolean
}

type DropdownSize = 'xs' | 'sm' | 'md' | 'lg'

interface DropdownProps {
    options: DropdownOption[]
    value: string
    onChange: (value: string) => void
    isLoading?: boolean
    placeholder?: string
    size?: DropdownSize
    disabled?: boolean
}

export default function Dropdown({
    options = [],
    value = '',
    onChange,
    isLoading = false,
    placeholder = 'Select an option',
    size = 'sm',
    disabled = false
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selected, setSelected] = useState<DropdownOption | null>(null)

    useEffect(() => {
        setSelected(options.find((opt) => opt.value === value) || null)
    }, [options, value])

    const handleSelect = (option: DropdownOption) => {
        if (option.disabled) return // ✅ prevent selecting disabled option
        setIsOpen(false)
        onChange(option.value)
    }

    const sizeClasses = {
        xs: 'text-xs px-1 py-0.5 rounded-md',
        sm: 'text-sm px-2 py-1 rounded-lg',
        md: 'text-base px-3 py-2 rounded-2xl',
        lg: 'text-lg px-4 py-3 rounded-3xl'
    }[size]

    return (
        <div className='relative inline-block text-left'>
            <div
                className={`
                    flex items-center gap-2 border cursor-pointer shadow-sm 
                    transition-colors select-none ${sizeClasses} rounded-t-3xl rounded-b-3xl
                    ${isOpen ? 'border-gray-400' : 'border-gray-300'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => !disabled && !isLoading && setIsOpen((prev) => !prev)}
                title={disabled ? 'Disabled selection' : 'Select an option'}
                style={{
                    backgroundColor: selected?.color || 'transparent'
                }}
            >
                <span
                    className={`truncate w-fit ${!selected ? 'text-gray-400 italic' : 'text-white'}`}
                >
                    {selected ? selected.label : placeholder}
                </span>

                {isLoading ? (
                    <Loader2 className='w-4 h-4 animate-spin text-white' />
                ) : (
                    <ChevronDown
                        className={`w-4 h-4 ${selected ? 'text-white' : 'text-gray-400'}`}
                    />
                )}
            </div>

            {isOpen && !isLoading && (
                <div className='absolute z-10 mt-1 w-fit bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto text-sm'>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`
                                px-3 py-2 transition-colors
                                ${option.disabled
                                    ? 'text-gray-400 opacity-50 cursor-not-allowed'
                                    : 'cursor-pointer hover:bg-gray-100'}
                                ${selected?.value === option.value ? 'font-semibold' : ''}
                            `}
                            onClick={() => !option.disabled && handleSelect(option)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}