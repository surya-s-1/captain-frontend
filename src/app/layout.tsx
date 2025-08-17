'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

import StoreProvider from '@/app/StoreProvider'
import AuthGuard from './AuthGaurd'

import Sidebar from '@/components/sidebar'
import Branding from '@/components/branding'

import { listenToAuthChanges } from '@/lib/firebaseListeners'

import './globals.css'

listenToAuthChanges()

export default function RootLayout({ children }) {
    const pathname = usePathname()

    return (
        <html lang='en'>
            <body>
                <StoreProvider>
                    <AuthGuard>
                        <div className='flex min-h-screen'>
                            {pathname!=='/login' && <Sidebar />}
                            <div className='w-full h-screen flex flex-col'>
                                <Branding />
                                <div className='w-full h-full flex flex-col items-center flex-1 overflow-hidden'>
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
