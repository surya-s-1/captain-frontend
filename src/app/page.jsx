'use client'

import { useEffect, useState } from 'react'

export default function Home() {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme')
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark')
                setIsDark(true)
            }
        }
    }, [])

    const toggleTheme = () => {
        const html = document.documentElement
        if (html.classList.contains('dark')) {
            html.classList.remove('dark')
            localStorage.setItem('theme', 'light')
            setIsDark(false)
        } else {
            html.classList.add('dark')
            localStorage.setItem('theme', 'dark')
            setIsDark(true)
        }
    }

    return (
        <div className='bg-primary text-color-primary dark:bg-primary dark:text-color-primary'>
            Hello!
            <button
                onClick={toggleTheme}
                className='px-4 py-2 rounded bg-primary text-primary-contrast'
            >
                {isDark ? 'Swith to Light Mode' : 'Swith to Dark Mode'}
            </button>
        </div>
    )
}
