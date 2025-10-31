import React, {
    useState,
    useMemo,
    useRef,
    useEffect,
    memo,
} from 'react'
import { ListFilter } from 'lucide-react'
import { ExpandingButton } from '@/lib/utility/ui/ExpandingButton'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type FilterType =
    | 'multi'
    | 'single'
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

type NormalizedFilterConfig = Record<
    string,
    Omit<FilterConfig[string], 'options'> & {
        options: NormalizedOption[]
    }
>

interface UseFilterOptions<T> {
    items: T[]
    config: FilterConfig
}

type Size = 'xs' | 'sm' | 'md' | 'lg'

// ─────────────────────────────────────────────
// FilterPopup Component (Memoized)
// ─────────────────────────────────────────────
const FilterPopup = memo(function FilterPopup({
    open,
    setOpen,
    derivedConfig,
    filters,
    setFilters,
    resetFilters,
    popupRef,
}: {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    derivedConfig: NormalizedFilterConfig
    filters: Record<string, any>
    setFilters: React.Dispatch<React.SetStateAction<Record<string, any>>>
    resetFilters: () => void
    popupRef: React.RefObject<HTMLDivElement>
}) {
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    if (!open) return null

    return (
        <div
            ref={popupRef}
            className='absolute bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 z-20 flex flex-col gap-4 max-h-[350px] p-4 bg-white/95 backdrop-blur-sm rounded-md shadow-lg border border-gray-200 overflow-auto scrollbar min-w-[18rem] text-gray-800'>
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
                            }}>
                            Clear
                        </button>
                    </div>

                    {cfg.type === 'multi' && (
                        <div className='flex flex-col gap-1 pl-1 scrollbar-thin'>
                            {cfg.options?.map((opt) => (
                                <label
                                    key={opt.value}
                                    className='inline-flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors'>
                                    <input
                                        type='checkbox'
                                        className='rounded text-blue-600 focus:ring-blue-500'
                                        checked={filters[field]?.includes(opt.value) || false}
                                        onChange={(e) => {
                                            const val = filters[field] || []
                                            if (e.target.checked)
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    [field]: [...val, opt.value],
                                                }))
                                            else
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    [field]: val?.filter((v: string) => v !== opt.value),
                                                }))
                                        }}
                                    />
                                    <span>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {cfg.type === 'single' && (
                        <div className='flex flex-col gap-1 pl-1 max-h-40 overflow-y-auto scrollbar-thin'>
                            {cfg.options?.map((opt) => (
                                <label
                                    key={opt.value}
                                    className='inline-flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors'>
                                    <input
                                        type='radio'
                                        name={field}
                                        className='text-blue-600 focus:ring-blue-500'
                                        checked={filters[field] === opt.value}
                                        onChange={() =>
                                            setFilters((prev) => ({ ...prev, [field]: opt.value }))
                                        }
                                    />
                                    <span>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {cfg.type === 'dateRange' && (
                        <div className='flex gap-2 pl-1'>
                            <input
                                type='date'
                                className='border border-gray-300 rounded-md text-sm px-2 py-1 w-full'
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
                                className='border border-gray-300 rounded-md text-sm px-2 py-1 w-full'
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
                    onClick={resetFilters}>
                    Reset All
                </button>
            </div>
        </div>
    )
})

// ─────────────────────────────────────────────
// FilterButton Component
// ─────────────────────────────────────────────
function FilterButton({
    open,
    setOpen,
    filteredItems,
    filters,
}: {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    filteredItems: any[]
    filters: Record<string, any>
}) {
    const hasActiveFilters = useMemo(() => {
        return Object.values(filters).some((val) => {
            if (Array.isArray(val)) return val.some((v) => v)
            return val !== '' && val != null
        })
    }, [filters])

    return (
        <div className='relative'>
            <ExpandingButton
                Icon={ListFilter}
                openLabel={hasActiveFilters ? `Filter (${filteredItems.length})` : 'Filter'}
                closedLabel={hasActiveFilters ? `(${filteredItems.length})` : ''}
                onClick={() => setOpen((prev) => !prev)}
                keepExpanded={open}
                size='md'
            />
            {hasActiveFilters && (
                <span className='absolute top-0 right-0 flex h-3 w-3'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
                    <span className='relative inline-flex rounded-full h-3 w-3 bg-red-500' />
                </span>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────
// useFilter Hook
// ─────────────────────────────────────────────
export function useFilter<T>({ items, config }: UseFilterOptions<T>) {
    const [filters, setFilters] = useState<Record<string, any>>({})
    const [open, setOpen] = useState(false)
    const popupRef = useRef<HTMLDivElement>(null)

    const derivedConfig = useMemo(() => {
        const derived: NormalizedFilterConfig = {}

        for (const [field, cfg] of Object.entries(config)) {
            const normalizedMap = new Map<string, string>()

            if (cfg.options && cfg.options.length) {
                cfg.options.forEach((opt) => {
                    const uniqueDataVals = Array.from(
                        new Set(items.map((i: any) => i[field]).filter((v) => v != null))
                    ).map(String);

                    if (uniqueDataVals.includes(opt.value)) {
                        normalizedMap.set(opt.value, opt.label)
                    }
                })
            }

            const uniqueDataVals = Array.from(
                new Set(items.map((i: any) => i[field]).filter((v) => v != null))
            ).map(String)

            uniqueDataVals.forEach((val) => {
                if (!normalizedMap.has(val)) normalizedMap.set(val, val)
            })

            const finalOptions: NormalizedOption[] = Array.from(
                normalizedMap.entries()
            ).map(([value, label]) => ({ value, label }))

            finalOptions.sort((a, b) => a.label.localeCompare(b.label))

            derived[field] = { ...cfg, options: finalOptions }
        }

        return derived
    }, [config, items])
    
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            return Object.entries(filters).every(([field, value]) => {
                const cfg = derivedConfig[field]
                const itemValue = (item as any)[field]
                if (!cfg || value == null || value === '' || (Array.isArray(value) && value.length === 0))
                    return true
                switch (cfg.type) {
                    case 'multi':
                        return value.includes(itemValue?.toString())
                    case 'single':
                        return itemValue?.toString() === value
                    case 'dateRange': {
                        const [start, end] = value as [string, string]
                        const d = new Date(itemValue)
                        return (!start || d >= new Date(start)) && (!end || d <= new Date(end))
                    }
                    case 'numberRange': {
                        const [minStr, maxStr] = value as [string, string]
                        const min = minStr ? Number(minStr) : null
                        const max = maxStr ? Number(maxStr) : null
                        const n = Number(itemValue)
                        return (!min || n >= min) && (!max || n <= max)
                    }
                    default:
                        return true
                }
            })
        })
    }, [items, filters, derivedConfig])

    const resetFilters = () => setFilters({})

    return {
        filteredItems,
        filters,
        setFilters,
        resetFilters,
        FilterButton: () => (
            <FilterButton
                open={open}
                setOpen={setOpen}
                filteredItems={filteredItems}
                filters={filters}
            />
        ),
        FilterPopup: () => (
            <FilterPopup
                open={open}
                setOpen={setOpen}
                derivedConfig={derivedConfig}
                filters={filters}
                setFilters={setFilters}
                resetFilters={resetFilters}
                popupRef={popupRef}
            />
        ),
    }
}