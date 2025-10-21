import { useState, useMemo } from 'react'

export function usePagination(items = [], itemsPerPage = 10) {
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.ceil(items.length / itemsPerPage)

    const currentItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return items.slice(startIndex, startIndex + itemsPerPage)
    }, [items, currentPage, itemsPerPage])

    const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages))
    const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1))
    const goToPage = (pageNum) =>
        setCurrentPage(Math.min(Math.max(pageNum, 1), totalPages))

    const Pagination = ({ className = '' }: { className?: string }) => (
        <div
            className={`w-fit bg-secondary rounded-md shadow-md flex justify-center items-center gap-4 ${className}`}
        >
            <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className='bg-primary px-4 py-2 rounded-md shadow-md cursor-pointer disabled:opacity-50'
            >
                Previous
            </button>

            <span>Page {currentPage} of {totalPages}</span>

            <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className='bg-primary px-4 py-2 rounded-md shadow-md cursor-pointer disabled:opacity-50'
            >
                Next
            </button>
        </div>
    )

    return {
        currentItems,
        Pagination,
        currentPage,
        totalPages,
        nextPage,
        prevPage,
        goToPage
    }
}
