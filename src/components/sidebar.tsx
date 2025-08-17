'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { PanelLeft, LayoutDashboard, Settings, SquarePen, Sun, Moon, LogOut } from 'lucide-react'

import { auth } from '@/lib/firebase'
import { SESSION_STORAGE } from '@/lib/constants'

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(true)
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

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded)
    }

    const handleLogout = async () => {
        await signOut(auth)
        sessionStorage.clear()
    }

    const navItems = [
        { label: 'New Chat', icon: SquarePen, link: '/chat' },
        { label: 'Dashboard', icon: LayoutDashboard, link: '/dashboard' },
        { label: 'Settings', icon: Settings, link: '/settings' },
    ]

    return (
        <div
            className={`flex flex-col h-screen
                        bg-secondary text-color-secondary
                        transition-all duration-300 ease-in-out
                        ${isExpanded ? 'w-80' : 'w-20'}
                        p-4 text-sm
                    `}
        >
            <div className='flex justify-between mb-4'>
                <button
                    onClick={toggleSidebar}
                    className='p-2 rounded-full hover:bg-tertiary hover:text-color-tertiary transition-colors duration-200 cursor-pointer'
                >
                    <PanelLeft size={24} className={`transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`} />
                </button>
                {isExpanded &&
                    <button
                        onClick={toggleTheme}
                        className='p-2 rounded-full hover:bg-tertiary hover:text-color-tertiary transition-colors duration-200 cursor-pointer'
                    >
                        {isDark ?
                            <Sun size={24} className={`transition-transform duration-300`} /> :
                            <Moon size={24} className={`transition-transform duration-300`} />}
                    </button>}
            </div>

            <nav className='flex-1'>
                <ul className='space-y-1'>
                    {navItems.map((item, index) => (
                        <li key={index}>
                            <a
                                href={item.link}
                                className='flex items-center space-x-3 p-2 rounded-lg hover:bg-tertiary hover:text-color-tertiary transition-colors duration-200 cursor-pointer'
                            >
                                <item.icon size={20} />
                                {isExpanded &&
                                    <span className='whitespace-nowrap overflow-hidden transition-opacity duration-300'>
                                        {item.label}
                                    </span>}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <button
                className='flex items-center space-x-3 p-2 rounded-lg text-red-500 hover:bg-tertiary transition-colors duration-200 cursor-pointer'
                onClick={handleLogout}
            >
                <LogOut size={20} />
                {isExpanded &&
                    <span className='whitespace-nowrap overflow-hidden transition-opacity duration-300'>
                        Logout
                    </span>}
            </button>
        </div>
    )
}

export default Sidebar