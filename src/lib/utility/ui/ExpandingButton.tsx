import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react'

interface ExpandingButtonProps {
    Icon: React.ElementType
    openLabel: string
    onClick: () => void
    closedLabel?: string
    isLoading?: boolean
    className?: string
    keepExpanded?: boolean
}

export function ExpandingButton({
    Icon,
    openLabel,
    onClick,
    closedLabel = '',
    isLoading = false,
    className = '',
    keepExpanded = false
}: ExpandingButtonProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [expand, setExpand] = useState(false)

    useEffect(() => {
        setExpand(isHovered || keepExpanded)
    }, [isHovered, keepExpanded])

    const widthClass = expand ? 'w-fit pr-4' : 'w-fit'
    const iconMarginClass = expand ? 'mr-2' : 'm-auto'

    const handleClick = () => {
        if (!isLoading) {
            onClick()
        }
    }

    return (
        <button
            onClick={() => handleClick()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={isLoading}
            className={`
                flex items-center gap-2 p-2 cursor-pointer rounded-full shadow-sm hover:shadow-md transform bg-primary
                transition-[width,padding,background-color,shadow] duration-300 ease-in-out shadow-black/30 dark:shadow-black/50
                ${widthClass} ${className}
            `}
            aria-label={openLabel}
        >
            {isLoading ? (
                <Loader2 className={`h-6 w-6 animate-spin ${iconMarginClass}`} />
            ) : (
                <Icon className={`h-6 w-6 transition-all duration-300 ${iconMarginClass}`} />
            )}

            {expand ? (
                <span className={`whitespace-nowrap overflow-hidden text-sm font-medium`}>
                    {openLabel}
                </span>
            ) : closedLabel ? (
                <span className={`whitespace-nowrap overflow-hidden text-sm font-medium`}>
                    {closedLabel}
                </span>
            ): <></>}
        </button>
    )
}

interface ExpandingLinkProps {
    Icon?: React.ElementType
    imageUrl?: string
    label: string
    href: string
    className?: string
}

export function ExpandingLink({
    Icon,
    imageUrl,
    label,
    href,
    className = ''
}: ExpandingLinkProps) {
    const [isHovered, setIsHovered] = useState(false)

    const widthClass = isHovered ? 'w-fit pr-4' : 'w-10'
    const iconMarginClass = isHovered ? 'mr-2' : 'm-auto'

    return (
        <a
            href={href}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            target='_blank'
            rel='noopener noreferrer'

            className={`
                flex items-center p-2 rounded-full shadow-sm hover:shadow-md transform bg-primary text-foreground
                transition-[width,padding,background-color,shadow] duration-300 ease-in-out shadow-black/30 dark:shadow-black/50
                ${widthClass} ${className}
            `}
            aria-label={label}
        >
            <div className={`flex items-center justify-center h-6 w-6 transition-all duration-300 ${iconMarginClass}`}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={`${label} icon`}
                        className='h-full w-full object-contain rounded-full'
                    />
                ) : Icon ? (
                    <Icon className='h-full w-full' />
                ) : <></>}
            </div>

            {isHovered && (
                <span className={`whitespace-nowrap overflow-hidden text-sm font-medium`}>
                    {label}
                </span>
            )}
        </a>
    )
}