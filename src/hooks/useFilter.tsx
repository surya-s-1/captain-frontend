import React, { useState, useMemo, useRef, useEffect } from 'react'
import { ListFilter } from 'lucide-react'

type FilterType =
    | 'multi'
    | 'single'
    | 'singleSearch'
    | 'dateRange'
    | 'numberRange'

interface OptionItem {
    value: string
    label: string
}

interface FilterConfig {
    [field: string]: {
        type: FilterType
        label?: string
        options?: OptionItem[]
    }
}

type NormalizedOption = { value: string; label: string }

type NormalizedFilterConfig = Record<string, Omit<FilterConfig[string], 'options'> & {
    options: NormalizedOption[]
}>

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
        const derived: NormalizedFilterConfig = {}

        for (const [field, cfg] of Object.entries(config)) {
            const normalizedMap = new Map<string, string>(); // key: value, value: label

            // 1. Process explicit options (prioritized)
            if (cfg.options && cfg.options.length) {
                cfg.options.forEach(opt => {
                    normalizedMap.set(opt.value, opt.label)
                })
            }

            // 2. Derive options from data (unique values)
            const uniqueDataVals = Array.from(
                new Set(items.map((i: any) => i[field]).filter((v) => v !== null && v !== undefined))
            ).map(String);

            // 3. Merge data-derived options
            uniqueDataVals.forEach(val => {
                if (!normalizedMap.has(val)) {
                    normalizedMap.set(val, val); // If no explicit label exists, use value as label
                }
            });

            // 4. Convert map to final sorted array of NormalizedOption
            const finalOptions: NormalizedOption[] = Array.from(normalizedMap.entries()).map(([value, label]) => ({
                value,
                label
            }))

            // Sort by label (optional, but good practice)
            finalOptions.sort((a, b) => a.label.localeCompare(b.label));

            derived[field] = {
                ...cfg,
                options: finalOptions
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
                // Use the new derivedConfig type
                const cfg = derivedConfig[field]
                const itemValue = (item as any)[field]

                // Ignore empty/null filters and config entries that don't exist
                if (!cfg || value == null || value === '' || (Array.isArray(value) && value.length === 0)) return true

                // Special check for number/date ranges where the array might be ['','']
                if (Array.isArray(value) && value.every(v => v === '' || v === null)) return true

                switch (cfg.type) {
                    case 'multi':
                        // Filter checks if the item's raw value is included in the filter array (of raw values)
                        return value.includes(itemValue.toString()) // Compare raw values
                    case 'single':
                    case 'singleSearch':
                        // Filter checks if the item's raw value matches the filter's raw value
                        return itemValue.toString() === value
                    case 'dateRange':
                        const [start, end] = value as [string, string]
                        const d = new Date(itemValue)
                        return (!start || d >= new Date(start)) && (!end || d <= new Date(end))
                    case 'numberRange':
                        const [minStr, maxStr] = value as [string, string]
                        const min = minStr ? Number(minStr) : null
                        const max = maxStr ? Number(maxStr) : null
                        const n = Number(itemValue)
                        return (!min || n >= min) && (!max || n <= max)
                    default:
                        return true
                }
            })
        })
    }, [items, filters, derivedConfig])

    const resetFilters = () => setFilters({})

    // ---- Searchable Single Select (Updated to use value/label) ----
    const SingleSearch = ({
        field,
        cfg,
    }: {
        field: string
        cfg: { options: NormalizedOption[] } // Uses normalized options
    }) => {
        const [query, setQuery] = useState('')
        const [dropdownOpen, setDropdownOpen] = useState(false)
        const wrapperRef = useRef<HTMLDivElement>(null)

        // Filter by the label for search matching
        const filteredOptions = (cfg.options || []).filter((opt) =>
            opt.label.toLowerCase().includes(query.toLowerCase())
        )

        // Determine the display text for the input field
        const currentFilterValue = filters[field]
        const selectedOption = cfg.options.find(opt => opt.value === currentFilterValue)
        const inputText = selectedOption ? selectedOption.label : (query || '')


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
                    value={inputText}
                    onChange={(e) => {
                        if (selectedOption) {
                            setFilters(prev => ({ ...prev, [field]: '' }));
                        }
                        setQuery(e.target.value)
                        setDropdownOpen(true)
                    }}
                    onFocus={() => setDropdownOpen(true)}
                />
                {dropdownOpen && filteredOptions.length > 0 && (
                    <div className='absolute z-50 bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-auto w-full shadow-md scrollbar'>
                        {filteredOptions.map((opt) => (
                            <div
                                key={opt.value}
                                className={`px-2 py-1 cursor-pointer hover:bg-gray-100 ${filters[field] === opt.value ? 'bg-gray-200 font-medium' : ''
                                    }`}
                                onClick={() => {
                                    setFilters((prev) => ({
                                        ...prev,
                                        [field]: prev[field] === opt.value ? '' : opt.value, // toggle select/deselect
                                    }))
                                    setQuery('')
                                    setDropdownOpen(false)
                                }}
                            >
                                {opt.label}
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
                if (Array.isArray(val)) {
                    // Check if array has non-empty/null values
                    if (val.length === 2) {
                        return val[0] !== '' || val[1] !== ''
                    } else if (val.length === 0) {
                        return false
                    }
                    return val.some((v) => v !== '' && v != null)
                }
                return val !== '' && val != null
            })
        }, [filters])

        return (
            <div className={`relative w-fit ${className}`} ref={popupRef}>
                {open && (
                    <div className='absolute bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 z-20 flex flex-col gap-4 max-h-[350px] p-4 bg-white/95 backdrop-blur-sm rounded-md shadow-lg border border-gray-200 overflow-auto scrollbar min-w-[18rem] text-gray-800'>
                        {Object.entries(derivedConfig).map(([field, cfg]) => (
                            <div key={field} className='pb-4 border-b border-gray-100 text-sm last:border-b-0'>
                                <div className='flex justify-between items-center mb-2'>
                                    <div className='font-bold text-gray-700'>{cfg.label || field}</div>
                                    <button
                                        className='text-xs text-blue-500 hover:text-blue-600 transition-colors cursor-pointer'
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
                                    <div className='flex flex-col gap-1 pl-1 max-h-40 overflow-y-auto scrollbar-thin'>
                                        {cfg.options?.map((opt) => (
                                            <label key={opt.value} className='inline-flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors'>
                                                <input
                                                    type='checkbox'
                                                    className='rounded text-blue-600 focus:ring-blue-500'
                                                    checked={filters[field]?.includes(opt.value) || false}
                                                    onChange={(e) => {
                                                        const val = filters[field] || []
                                                        if (e.target.checked)
                                                            setFilters((prev) => ({
                                                                ...prev,
                                                                [field]: [...val, opt.value], // Use VALUE
                                                            }))
                                                        else
                                                            setFilters((prev) => ({
                                                                ...prev,
                                                                [field]: val.filter((v: string) => v !== opt.value), // Filter by VALUE
                                                            }))
                                                    }}
                                                />
                                                <span>{opt.label}</span> {/* Display LABEL */}
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {cfg.type === 'single' && (
                                    <div className='flex flex-col gap-1 pl-1 max-h-40 overflow-y-auto scrollbar-thin'>
                                        {cfg.options?.map((opt) => (
                                            <label key={opt.value} className='inline-flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors'>
                                                <input
                                                    type='radio'
                                                    name={field}
                                                    className='text-blue-600 focus:ring-blue-500'
                                                    checked={filters[field] === opt.value} // Check against VALUE
                                                    onChange={() => setFilters((prev) => ({ ...prev, [field]: opt.value }))} // Set with VALUE
                                                />
                                                <span>{opt.label}</span> {/* Display LABEL */}
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {cfg.type === 'singleSearch' && (
                                    <div className='pl-1'>
                                        {/* Pass the normalized options */}
                                        <SingleSearch field={field} cfg={cfg as any} />
                                    </div>
                                )}

                                {cfg.type === 'dateRange' && (
                                    <div className='flex gap-2 pl-1'>
                                        <input
                                            type='date'
                                            title='Start Date'
                                            className='border border-gray-300 rounded-md text-sm px-2 py-1 w-full focus:ring-blue-500 focus:border-blue-500'
                                            value={filters[field]?.[0] || ''}
                                            onChange={(e) =>
                                                setFilters((p) => ({
                                                    ...p,
                                                    [field]: [e.target.value, p[field]?.[1] || ''],
                                                }))
                                            }
                                        />
                                        <span className='self-center text-gray-500'>to</span>
                                        <input
                                            type='date'
                                            title='End Date'
                                            className='border border-gray-300 rounded-md text-sm px-2 py-1 w-full focus:ring-blue-500 focus:border-blue-500'
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
                                    <div className='flex gap-2 pl-1'>
                                        <input
                                            type='number'
                                            placeholder='Min'
                                            className='border border-gray-300 rounded-md text-sm px-2 py-1 w-full focus:ring-blue-500 focus:border-blue-500'
                                            value={filters[field]?.[0] || ''}
                                            onChange={(e) =>
                                                setFilters((p) => ({
                                                    ...p,
                                                    [field]: [e.target.value, p[field]?.[1] || ''],
                                                }))
                                            }
                                        />
                                        <span className='self-center text-gray-500'>to</span>
                                        <input
                                            type='number'
                                            placeholder='Max'
                                            className='border border-gray-300 rounded-md text-sm px-2 py-1 w-full focus:ring-blue-500 focus:border-blue-500'
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

                        <div className='flex justify-end pt-2'>
                            <button
                                className='text-xs px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer'
                                onClick={resetFilters}
                            >
                                Reset All
                            </button>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setOpen((open) => !open)}
                    className={`relative flex px-4 items-center gap-2 w-fit rounded-lg shadow-lg bg-primary hover:bg-secondary border border-gray-300 cursor-pointer transition-all select-none ${sizeClasses}`}
                >
                    <ListFilter className='w-4 h-4' />
                    <span>Filter</span>

                    {hasActiveFilters && (
                        <span className='absolute -top-1 -right-1 flex h-3 w-3'>
                            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
                            <span className='relative inline-flex rounded-full h-3 w-3 bg-red-500' />
                        </span>
                    )}
                </button>
            </div>
        )
    }

    return { filteredItems, filters, setFilters, resetFilters, FilterComponent }
}