'use client'

import React, { useState } from 'react'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

import StoreProvider from '@/components/store-provider'
import AuthGuard from '@/components/auth-gaurd'

import Sidebar from '@/components/sidebar'
import Branding from '@/components/branding'

import { listenToAuthChanges } from '@/lib/firebase/utilities'

import './globals.css'

listenToAuthChanges()

export default function RootLayout({ children }) {
    const pathname = usePathname()
    const [sidebarExpanded, setSidebarExpanded] = useState(true)

    useEffect(() => {
        document.title = 'Sage App'
    }, [])

    return (
        <html lang='en'>
            <body>
                <StoreProvider>
                    <AuthGuard>
                        <div className='flex h-screen'>
                            {pathname !== '/login' && (
                                <>
                                    <Sidebar
                                        sidebarExpanded={sidebarExpanded}
                                        setSidebarExpanded={setSidebarExpanded}
                                    />
                                    {sidebarExpanded && (
                                        <div
                                            className='fixed inset-0 bg-black opacity-50 z-20 lg:hidden'
                                        ></div>
                                    )}
                                </>
                            )}
                            <div className={`flex flex-col w-full`}>
                                {pathname !== '/login' ?
                                <>
                                    <div className='lg:hidden flex items-center justify-between bg-primary'>
                                        <button 
                                            onClick={() => { setSidebarExpanded(!sidebarExpanded) }} 
                                            className='ml-4 text-color-primary'
                                        >
                                            <Menu size={24} />
                                        </button>
                                        <Branding />
                                    </div>
                                    <div className='hidden lg:block'>
                                        <Branding />
                                    </div>
                                </> :
                                    <Branding />}
                                <div className='w-full flex flex-col flex-1 items-center overflow-hidden'>
                                    {children}
                                </div>
                            </div>
                        </div>
                    </AuthGuard>
                </StoreProvider>
            </body>
        </html>
    )
}
