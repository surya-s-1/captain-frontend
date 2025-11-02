import { useState, useMemo } from 'react'

export function useTabFilter(
    items: any[],
    config: {
        field: string,
        valueLabels?: Record<string, string>,
        valueColors?: Record<string, string>
    }
) {
    const [selectedValue, setSelectedValue] = useState('All')

    const uniqueValues = useMemo(() => {
        if (!config || !items.length || !config.field) return []
        return Array.from(new Set(items.map(item => item[config.field])))
    }, [items, config])

    const filteredItems = useMemo(() => {
        if (selectedValue === 'All' || !config || !config.field) {
            return items
        }
        return items.filter(item => item[config.field] === selectedValue)
    }, [items, config, selectedValue])

    const TabFilterComponent = ({ uniqueValues, selectedValue, setSelectedValue, config }) => {
        const filterOptions = uniqueValues?.length ? ['All', ...uniqueValues] : []
        const valueColors = config?.valueColors || {}
        const valueLabels = config?.valueLabels || {}

        return (
            <div className={`flex w-fit overflow-x-auto scrollbar bg-secondary rounded-md border border-gray-300 shadow-md scrollbar-hide`}>
                {filterOptions.map((option) => {
                    return (
                        <button
                            key={option}
                            onClick={() => setSelectedValue(option)}
                            className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer flex-shrink-0 ${option === selectedValue ? `${valueColors?.[option] || 'bg-primary'} shadow-md transform scale-105` : ''}`}
                        >
                            {valueLabels?.[option] || option}
                        </button>
                    )
                })}
            </div>
        )
    }

    return {
        filteredItems,
        uniqueValues,
        config,
        selectedValue,
        setSelectedValue,
        TabFilterComponent
    }
}