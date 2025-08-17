import React from 'react'

import StoreProvider from '@/app/StoreProvider'

import Sidebar from '@/components/sidebar'
import Branding from '@/components/branding'

import './globals.css'

export const metadata = {
    title: 'Beta App',
    description: 'Work In Progress',
}

export default function RootLayout({ children }) {
    return (
        <html lang='en'>
            <body>
                <StoreProvider>
                    <div className='flex min-h-screen'>
                        <Sidebar />
                        <div className='w-full h-screen flex flex-col'>
                            <Branding />
                            <div className='w-full h-full flex flex-col items-center flex-1 overflow-hidden'>
                                {children}
                            </div>
                        </div>
                    </div>
                </StoreProvider>
            </body>
        </html>
    )
}
