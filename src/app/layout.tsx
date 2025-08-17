import React from 'react'
import Sidebar from '@/components/sidebar'
import Branding from '@/components/branding'

import './globals.css'

export const metadata = {
  title: 'Next App',
  description: 'Work In Progress',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>
        <div className='flex min-h-screen'>
          <Sidebar />
          <div className='w-full flex flex-col'>
            <Branding />
            <div className='w-full h-full flex flex-col items-center'>
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
