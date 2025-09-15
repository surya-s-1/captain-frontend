'use client'

import React from 'react'
import Captain from '@/../public/Captain_Logo.png'

const Branding = () => {
    return (
        <header className='w-full sticky top-0 p-4'>
            <div className='flex-col items-center space-y-sm'>
                <div className='flex items-center gap-1'>
                    <img src={Captain.src} width={40} />
                    <span className='bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent text-4xl'>Captain</span>
                </div>
                {/* Add any dropdowns in the future here */}
            </div>
        </header>
    )
}

export default Branding