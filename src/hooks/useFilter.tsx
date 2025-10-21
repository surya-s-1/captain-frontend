import React, { useState, useMemo, useRef, useEffect } from 'react'
import { ListFilter } from 'lucide-react'

type FilterType =
    | 'multi'
    | 'single'
    | 'singleSearch'
    | 'dateRange'
    | 'numberRange'

interface FilterConfig {
    [field: string]: {
        type: FilterType
        label?: string
        options?: string[]
    }
}

interface UseFilterOptions<T> {
    items: T[]
    config: FilterConfig
}

type Size = 'xs' | 'sm' | 'md' | 'lg'

export function useFilter<T>({ items, config }: UseFilterOptions<T>) {
    const [filters, setFilters] = useState<Record<string, any>>({})
    const [open, setOpen] = useState(false)
    const popupRef = useRef<HTMLDivElement>(null)

    const derivedConfig = useMemo(() => {
        const derived: FilterConfig = {}
        for (const [field, cfg] of Object.entries(config)) {
            if (cfg.options && cfg.options.length) {
                derived[field] = cfg
            } else {
                const uniqueVals = Array.from(
                    new Set(items.map((i: any) => i[field]).filter(Boolean))
                )
                derived[field] = { ...cfg, options: uniqueVals }
            }
        }
        return derived
    }, [config, items])

    // Close popup when clicking outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [open])

    // Filtering logic
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            return Object.entries(filters).every(([field, value]) => {
                const cfg = derivedConfig[field]
                const itemValue = (item as any)[field]
                if (!cfg || value == null || value === '') return true

                switch (cfg.type) {
                    case 'multi':
                        return value.length === 0 || value.includes(itemValue)
                    case 'single':
                    case 'singleSearch':
                        return !value || itemValue === value
                    case 'dateRange':
                        const [start, end] = value
                        const d = new Date(itemValue)
                        return (!start || d >= new Date(start)) && (!end || d <= new Date(end))
                    case 'numberRange':
                        const [min, max] = value
                        const n = Number(itemValue)
                        return (!min || n >= min) && (!max || n <= max)
                    default:
                        return true
                }
            })
        })
    }, [items, filters, derivedConfig])

    const resetFilters = () => setFilters({})

    // ---- Searchable Single Select ----
    const SingleSearch = ({
        field,
        cfg,
    }: {
        field: string
        cfg: { options?: string[] }
    }) => {
        const [query, setQuery] = useState('')
        const [dropdownOpen, setDropdownOpen] = useState(false)
        const wrapperRef = useRef<HTMLDivElement>(null)

        const filteredOptions = (cfg.options || []).filter((opt) =>
            opt.toLowerCase().includes(query.toLowerCase())
        )

        useEffect(() => {
            const handleClickOutside = (e: MouseEvent) => {
                if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                    setDropdownOpen(false)
                }
            }
            if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }, [dropdownOpen])

        return (
            <div className='relative scrollbar text-sm' ref={wrapperRef}>
                <input
                    type='text'
                    placeholder={`Search ${field}...`}
                    className='w-full rounded-md border border-gray-300 px-2 py-1'
                    value={query || filters[field] || ''}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setDropdownOpen(true)
                    }}
                    onFocus={() => setDropdownOpen(true)}
                />
                {dropdownOpen && filteredOptions.length > 0 && (
                    <div className='absolute z-50 bg-primary border border-gray-300 rounded-md mt-1 max-h-40 overflow-auto w-full shadow-md scrollbar'>
                        {filteredOptions.map((opt) => (
                            <div
                                key={opt}
                                className={`px-2 py-1 cursor-pointer hover:bg-primary/20 ${filters[field] === opt ? 'bg-primary/30 font-medium' : ''
                                    }`}
                                onClick={() => {
                                    setFilters((prev) => ({
                                        ...prev,
                                        [field]: prev[field] === opt ? '' : opt, // toggle select/deselect
                                    }))
                                    setQuery('')
                                    setDropdownOpen(false)
                                }}
                            >
                                {opt}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    function FilterComponent({
        size = 'md',
        className = '',
    }: { size?: Size, className?: string }) {
        const sizeMap: Record<Size, string> = {
            xs: 'text-xs p-1',
            sm: 'text-sm p-1.5',
            md: 'text-base p-2',
            lg: 'text-lg p-3',
        }

        const sizeClasses = sizeMap[size]

        const hasActiveFilters = useMemo(() => {
            return Object.values(filters).some((val) => {
                if (Array.isArray(val)) return val.some((v) => v !== '' && v != null)
                return val !== '' && val != null
            })
        }, [filters])

        return (
            <div className={`relative w-fit ${className}`} ref={popupRef}>
                {open && (
                    <div className='absolute bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 z-20 flex flex-col gap-4 max-h-[350px] p-2 bg-primary/50 backdrop-blur-sm rounded-md shadow-md border border-gray-300 overflow-auto scrollbar min-w-[18rem]'>
                        {Object.entries(derivedConfig).map(([field, cfg]) => (
                            <div key={field} className='pb-4 border-b border-gray-400 text-sm'>
                                <div className='flex justify-between items-center mb-1'>
                                    <div className='font-semibold'>{cfg.label || field}</div>
                                    <button
                                        className='text-xs text-color-primary hover:underline cursor-pointer'
                                        onClick={() => {
                                            if (cfg.type === 'multi') setFilters((p) => ({ ...p, [field]: [] }))
                                            else if (cfg.type === 'dateRange' || cfg.type === 'numberRange')
                                                setFilters((p) => ({ ...p, [field]: ['', ''] }))
                                            else setFilters((p) => ({ ...p, [field]: '' }))
                                        }}
                                    >
                                        Clear
                                    </button>
                                </div>

                                {cfg.type === 'multi' && (
                                    <div className='flex flex-col gap-1 pl-1'>
                                        {cfg.options?.map((opt) => (
                                            <label key={opt} className='inline-flex items-center gap-1'>
                                                <input
                                                    type='checkbox'
                                                    checked={filters[field]?.includes(opt) || false}
                                                    onChange={(e) => {
                                                        const val = filters[field] || []
                                                        if (e.target.checked)
                                                            setFilters((prev) => ({
                                                                ...prev,
                                                                [field]: [...val, opt],
                                                            }))
                                                        else
                                                            setFilters((prev) => ({
                                                                ...prev,
                                                                [field]: val.filter((v: string) => v !== opt),
                                                            }))
                                                    }}
                                                />
                                                <span>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {cfg.type === 'single' && (
                                    <div className='flex flex-col gap-1 pl-1'>
                                        {cfg.options?.map((opt) => (
                                            <label key={opt} className='inline-flex items-center gap-1'>
                                                <input
                                                    type='radio'
                                                    name={field}
                                                    checked={filters[field] === opt}
                                                    onChange={() => setFilters((prev) => ({ ...prev, [field]: opt }))}
                                                />
                                                <span>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {cfg.type === 'singleSearch' && (
                                    <div className='pl-1'>
                                        <SingleSearch field={field} cfg={cfg} />
                                    </div>
                                )}

                                {cfg.type === 'dateRange' && (
                                    <div className='flex gap-1 pl-1'>
                                        <input
                                            type='date'
                                            className='border rounded-md text-sm px-2 py-1'
                                            value={filters[field]?.[0] || ''}
                                            onChange={(e) =>
                                                setFilters((p) => ({
                                                    ...p,
                                                    [field]: [e.target.value, p[field]?.[1] || ''],
                                                }))
                                            }
                                        />
                                        <input
                                            type='date'
                                            className='border rounded-md text-sm px-2 py-1'
                                            value={filters[field]?.[1] || ''}
                                            onChange={(e) =>
                                                setFilters((p) => ({
                                                    ...p,
                                                    [field]: [p[field]?.[0] || '', e.target.value],
                                                }))
                                            }
                                        />
                                    </div>
                                )}

                                {cfg.type === 'numberRange' && (
                                    <div className='flex gap-1 pl-1'>
                                        <input
                                            type='number'
                                            placeholder='Min'
                                            className='w-20 border rounded-md text-sm px-2 py-1'
                                            value={filters[field]?.[0] || ''}
                                            onChange={(e) =>
                                                setFilters((p) => ({
                                                    ...p,
                                                    [field]: [e.target.value, p[field]?.[1] || ''],
                                                }))
                                            }
                                        />
                                        <input
                                            type='number'
                                            placeholder='Max'
                                            className='w-20 border rounded-md text-sm px-2 py-1'
                                            value={filters[field]?.[1] || ''}
                                            onChange={(e) =>
                                                setFilters((p) => ({
                                                    ...p,
                                                    [field]: [p[field]?.[0] || '', e.target.value],
                                                }))
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className='flex justify-end'>
                            <button
                                className='text-xs px-2 py-1 border rounded cursor-pointer'
                                onClick={resetFilters}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setOpen((open) => !open)}
                    className={`relative flex px-4 items-center gap-2 w-fit rounded-md shadow-md bg-primary cursor-pointer transition-all select-none ${sizeClasses}`}
                >
                    <ListFilter className='w-4 h-4' />
                    <span>Filter</span>

                    {hasActiveFilters && (
                        <span className='absolute top-1.5 right-1 block w-2 h-2 rounded-full bg-red-500' />
                    )}
                </button>
            </div>
        )
    }
    
    return { filteredItems, filters, setFilters, resetFilters, FilterComponent }
}
