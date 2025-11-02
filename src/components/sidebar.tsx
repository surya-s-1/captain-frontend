'use client'

import React, { lazy } from 'react'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { signOut } from 'firebase/auth'
import { PanelLeft, X, Cable, LayoutDashboard, Settings, MessageSquare, CircleAlert, LogOut, CircleQuestionMark } from 'lucide-react'

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

    const lowerNavItems = [
        { label: 'Help', icon: CircleQuestionMark, link: '/help', target_blank: false },
        { label: 'Notice', icon: CircleAlert, link: '/notice', target_blank: true },
        { label: 'Settings', icon: Settings, link: '/settings', target_blank: false }
    ]

    const navButtonClass = 'flex items-center space-x-3 p-2 rounded-lg hover:bg-white/20 backdrop-blur-sm transition-colors duration-200 cursor-pointer'

    return (
        <div
            className={`fixed inset-y-0 left-0 z-40 flex flex-col h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarExpanded ? 'w-64 lg:w-80 translate-x-0' : '-translate-x-full w-0 lg:w-20'} p-4 text-sm`}
        >
            <div className='flex justify-between mb-4'>
                <button
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                    className='p-2 rounded-full hover:bg-white/30 backdrop-blur-sm transition-colors duration-200 cursor-pointer hidden lg:block'
                >
                    <PanelLeft size={24} className={`transition-transform duration-300 ${sidebarExpanded ? 'block' : 'hidden lg:block rotate-180'}`} />
                </button>
                <button
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                    className='p-2 rounded-full hover:bg-white/30 backdrop-blur-sm transition-colors duration-200 cursor-pointer block lg:hidden'
                >
                    <X size={24} className={`transition-transform duration-300 ${sidebarExpanded ? 'block' : 'hidden rotate-180'}`} />
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
                {lowerNavItems.map((item, index) => (
                    <a
                        key={index}
                        href={item.link}
                        target={item.target_blank ? '_blank' : '_self'}
                        className={navButtonClass}
                    >
                        <item.icon size={20} />
                        {sidebarExpanded &&
                            <span className='whitespace-nowrap overflow-hidden transition-opacity duration-300'>
                                {item.label}
                            </span>}
                    </a>))}
            </div>
            <div className='mt-auto'>
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