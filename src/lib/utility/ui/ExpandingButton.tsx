import React, { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react'

interface ExpandingButtonProps {
    Icon: React.ElementType
    label: string
    onClick: () => void
    isLoading?: boolean
    className?: string
}

export function ExpandingButton({
    Icon,
    label,
    onClick,
    isLoading = false,
    className = '',
}: ExpandingButtonProps) {
    const [isHovered, setIsHovered] = useState(false)

    const widthClass = isHovered ? 'w-fit pr-4' : 'w-10'
    const iconMarginClass = isHovered ? 'mr-2' : 'm-auto'

    const handleClick = useCallback(() => {
        if (!isLoading) {
            onClick()
        }
    }, [onClick, isLoading])

    return (
        <button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={isLoading}

            className={`
                flex items-center gap-2 p-2 cursor-pointer rounded-full shadow-sm hover:shadow-md transform bg-primary
                transition-[width,padding,background-color,shadow] duration-300 ease-in-out shadow-black/30 dark:shadow-black/50
                ${widthClass} ${className}
            `}
            aria-label={label}
        >
            {isLoading ? (
                <Loader2 className={`h-6 w-6 animate-spin ${iconMarginClass}`} />
            ) : (
                <Icon className={`h-6 w-6 transition-all duration-300 ${iconMarginClass}`} />
            )}

            {isHovered && (
                <span className={`whitespace-nowrap overflow-hidden text-sm font-medium`}>
                    {label}
                </span>
            )}
        </button>
    )
}