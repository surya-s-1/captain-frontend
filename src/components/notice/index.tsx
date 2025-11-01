'use client'

import { useState, useEffect } from 'react'

import { Markdown } from '@/lib/utility/ui/Markdown'

export default function Notice() {
    const [data, setData] = useState('')

    useEffect(() => {
        fetch('/README.md')
            .then((response) => response.text())
            .then((data) => setData(data))
            .catch((error) => console.error('Error fetching help data:', error))
    }, [])

    return (
        <div className='w-full flex-col overflow-auto scrollbar'>
            <div className='w-full sticky top-0 backdrop-blur-xs bg-white/30 shadow-md p-4 flex justify-center text-3xl font-semibold'>
                NOTICE
            </div>
            <div className='p-8'>
                <Markdown text={data} />
            </div>
        </div>
    )
}
