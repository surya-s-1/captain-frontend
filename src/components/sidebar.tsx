'use client'

import React from 'react'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { signOut } from 'firebase/auth'
import { PanelLeft, Cable, LayoutDashboard, Settings, MessageSquare, CircleAlert, LogOut } from 'lucide-react'

import { auth } from '@/lib/firebase'
import { RootState } from '@/lib/store'
import { clearMessages } from '@/lib/slices/chat'
import { clearUser } from '@/lib/slices/user'
import { clearSessionId } from '@/lib/slices/askCaptain'

const Sidebar = ({ sidebarExpanded, setSidebarExpanded }) => {
    const appUser = useSelector((state: RootState) => state.user)
    const dispatch = useDispatch()

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (appUser.theme === 'dark') {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        }
    }, [appUser])

    const handleLogout = async () => {
        dispatch(clearSessionId())
        dispatch(clearMessages())
        dispatch(clearUser())
        await signOut(auth)
    }

    const navItems = [
        { label: 'Integrations', icon: Cable, link: '/integrations' },
        { label: 'Projects', icon: LayoutDashboard, link: '/projects' },
        { label: 'Ask Captain', icon: MessageSquare, link: '/ask-captain' }
    ]

    const iconClass = 'p-2 rounded-full hover:bg-tertiary hover:text-color-tertiary transition-colors duration-200 cursor-pointer'
    const navButtonClass = 'flex items-center space-x-3 p-2 rounded-lg hover:bg-tertiary hover:text-color-tertiary transition-colors duration-200 cursor-pointer'

    return (
        <div
            className={`fixed inset-y-0 left-0 z-10 flex flex-col h-full bg-secondary text-color-secondary transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarExpanded ? 'w-64 lg:w-80 translate-x-0' : '-translate-x-full w-0 lg:w-20'} p-4 text-sm`}
        >
            <div className='flex justify-between mb-4'>
                <button
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                    className={iconClass}
                >
                    <PanelLeft size={24} className={`transition-transform duration-300 ${sidebarExpanded ? 'block' : 'hidden lg:block rotate-180'}`} />
                </button>
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
                                {sidebarExpanded &&
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
                    href={'/notice'}
                    className={navButtonClass}
                >
                    <CircleAlert size={20} />
                    {sidebarExpanded &&
                        <span className='whitespace-nowrap overflow-hidden transition-opacity duration-300'>
                            Notice
                        </span>}
                </a>
                <a
                    href={'/settings'}
                    className={navButtonClass}
                >
                    <Settings size={20} />
                    {sidebarExpanded &&
                        <span className='whitespace-nowrap overflow-hidden transition-opacity duration-300'>
                            Settings
                        </span>}
                </a>
                <button
                    className={`${navButtonClass} w-full text-red-500 hover:text-red-500`}
                    onClick={handleLogout}
                >
                    <LogOut size={20} />
                    {sidebarExpanded &&
                        <span className='whitespace-nowrap overflow-hidden transition-opacity duration-300'>
                            Logout
                        </span>}
                </button>
            </div>
        </div>
    )
}

export default Sidebar