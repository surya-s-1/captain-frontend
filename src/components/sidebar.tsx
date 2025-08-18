'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { signOut } from 'firebase/auth'
import { PanelLeft, LayoutDashboard, Settings, SquarePen, Sun, Moon, LogOut } from 'lucide-react'

import { auth } from '@/lib/firebase'
import { RootState } from '@/lib/store'
import { toggleMode } from '@/lib/slices/user'

const Sidebar = () => {
    const appUser = useSelector((state: RootState) => state.user)
    const [isExpanded, setIsExpanded] = useState(true)
    const isDark = appUser.mode === 'dark'

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme')
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark')
                toggleMode('dark')
            } else {
                toggleMode('light')
            }
        }
    }, [])

    const toggleTheme = () => {
        const html = document.documentElement
        if (html.classList.contains('dark')) {
            html.classList.remove('dark')
            localStorage.setItem('theme', 'light')
            toggleMode('light')
        } else {
            html.classList.add('dark')
            localStorage.setItem('theme', 'dark')
            toggleMode('dark')
        }
    }

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded)
    }

    const handleLogout = async () => {
        await signOut(auth)
    }

    const navItems = [
        { label: 'New Chat', icon: SquarePen, link: '/chat' },
        { label: 'Dashboard', icon: LayoutDashboard, link: '/dashboard' }
    ]

    const iconClass = 'p-2 rounded-full hover:bg-tertiary hover:text-color-tertiary transition-colors duration-200 cursor-pointer'

    const navButtonClass = 'flex items-center space-x-3 p-2 rounded-lg hover:bg-tertiary hover:text-color-tertiary transition-colors duration-200 cursor-pointer'

    return (
        <div
            className={`flex flex-col h-screen bg-secondary text-color-secondary transition-all duration-300 ease-in-out ${isExpanded ? 'w-80' : 'w-20'} p-4 text-sm`}
        >
            <div className='flex justify-between mb-4'>
                <button
                    onClick={toggleSidebar}
                    className={iconClass}
                >
                    <PanelLeft size={24} className={`transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`} />
                </button>
                {isExpanded &&
                    <button
                        onClick={toggleTheme}
                        className={iconClass}
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
                                className={navButtonClass}
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

            <div>
                <a
                    href={'/settings'}
                    className={navButtonClass}
                >
                    <Settings size={20} />
                    {isExpanded &&
                        <span className='whitespace-nowrap overflow-hidden transition-opacity duration-300'>
                            Settings
                        </span>}
                </a>
                <button
                    className={`${navButtonClass} w-full text-red-500 hover:text-red-500`}
                    onClick={handleLogout}
                >
                    <LogOut size={20} />
                    {isExpanded &&
                        <span className='whitespace-nowrap overflow-hidden transition-opacity duration-300'>
                            Logout
                        </span>}
                </button>
            </div>
        </div>
    )
}

export default Sidebar