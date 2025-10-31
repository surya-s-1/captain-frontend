import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

type ButtonSize = 'sm' | 'md' | 'lg'

interface ExpandingButtonProps {
    Icon: React.ElementType
    openLabel: string
    onClick: () => void
    closedLabel?: string
    isLoading?: boolean
    className?: string
    keepExpanded?: boolean
    size?: ButtonSize
}

export function ExpandingButton({
    Icon,
    openLabel,
    onClick,
    closedLabel = '',
    isLoading = false,
    className = '',
    keepExpanded = false,
    size = 'md'
}: ExpandingButtonProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [expand, setExpand] = useState(false)

    useEffect(() => {
        setExpand(isHovered || keepExpanded)
    }, [isHovered, keepExpanded])

    const sizeMap = {
        sm: {
            iconSize: 'h-5 w-5',
            fontSize: 'text-xs',
            padding: 'p-1.5',
            gap: 'gap-0.5',
            shadow: 'shadow-sm hover:shadow-md',
            closedWidth: 'w-fit',
            expandedPaddingRight: 'pr-3',
        },
        md: {
            iconSize: 'h-6 w-6',
            fontSize: 'text-sm',
            padding: 'p-2',
            gap: 'gap-1',
            shadow: 'shadow-md hover:shadow-lg',
            closedWidth: 'w-fit',
            expandedPaddingRight: 'pr-4',
        },
        lg: {
            iconSize: 'h-8 w-8',
            fontSize: 'text-base',
            padding: 'p-3',
            gap: 'gap-1.5',
            shadow: 'shadow-lg hover:shadow-xl',
            closedWidth: 'w-fit',
            expandedPaddingRight: 'pr-6',
        },
    }

    const { iconSize, fontSize, padding, gap, shadow, closedWidth, expandedPaddingRight } = sizeMap[size]

    const widthClass = expand ? `w-fit ${expandedPaddingRight}` : closedWidth
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
                flex items-center ${gap} ${padding} cursor-pointer rounded-full border-[1] border-gray-300 ${shadow} transform bg-primary transition-[width,padding,background-color,shadow] duration-300 ease-in-out ${widthClass} ${className}
            `}
        >
            {isLoading ? (
                <Loader2 className={`${iconSize} animate-spin ${iconMarginClass}`} />
            ) : (
                <Icon className={`${iconSize} transition-all duration-300 ${iconMarginClass}`} />
            )}

            {expand ? (
                <span className={`whitespace-nowrap overflow-hidden ${fontSize} font-medium`}>
                    {openLabel}
                </span>
            ) : closedLabel ? (
                <span className={`whitespace-nowrap overflow-hidden ${fontSize} font-medium`}>
                    {closedLabel}
                </span>
            ) : <></>}
        </button>
    )
}

// ---

interface ExpandingLinkProps {
    Icon?: React.ElementType
    imageUrl?: string
    label: string
    href: string
    className?: string
    size?: ButtonSize
}

export function ExpandingLink({
    Icon,
    imageUrl,
    label,
    href,
    className = '',
    size = 'md'
}: ExpandingLinkProps) {
    const [isHovered, setIsHovered] = useState(false)

    const sizeMap = {
        sm: {
            iconSize: 'h-5 w-5',
            fontSize: 'text-xs',
            padding: 'p-1.5',
            gap: 'gap-0.5',
            shadow: 'shadow-sm hover:shadow-md',
            closedWidth: 'w-fit',
            expandedPaddingRight: 'pr-3',
        },
        md: {
            iconSize: 'h-6 w-6',
            fontSize: 'text-sm',
            padding: 'p-2',
            gap: 'gap-1',
            shadow: 'shadow-md hover:shadow-lg',
            closedWidth: 'w-fit',
            expandedPaddingRight: 'pr-4',
        },
        lg: {
            iconSize: 'h-8 w-8',
            fontSize: 'text-base',
            padding: 'p-3',
            gap: 'gap-1.5',
            shadow: 'shadow-lg hover:shadow-xl',
            closedWidth: 'w-fit',
            expandedPaddingRight: 'pr-6',
        },
    }

    const { iconSize, fontSize, padding, gap, shadow, closedWidth, expandedPaddingRight } = sizeMap[size]

    const widthClass = isHovered ? `w-fit ${expandedPaddingRight}` : closedWidth
    const iconMarginClass = isHovered ? 'mr-2' : 'm-auto'

    return (
        <a
            href={href}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            target='_blank'
            rel='noopener noreferrer'
            className={`
                flex items-center ${gap} ${padding} cursor-pointer rounded-full border-[1] border-gray-300 shadow-black/20 ${shadow} transform bg-primary transition-[width,padding,background-color,shadow] duration-300 ease-in-out ${widthClass} ${className}
            `}
        >
            <div className={`flex items-center justify-center ${iconSize} transition-all duration-300 ${iconMarginClass}`}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={`${label} icon`}
                        className='h-full w-full object-contain rounded-full'
                    />
                ) : Icon ? (
                    <Icon className='w-full h-full' />
                ) : <></>}
            </div>

            {isHovered && (
                <span className={`whitespace-nowrap overflow-hidden ${fontSize} font-medium`}>
                    {label}
                </span>
            )}
        </a>
    )
}