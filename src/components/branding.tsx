'use client'

import React from 'react'

const Branding = () => {
    return (
        <header className='w-full bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent sticky top-0 py-4 px-8'>
            <div className='flex-col items-center space-y-sm'>
                <span className='text-4xl'>Captain</span>
                {/* Add any dropdowns in the future here */}
            </div>
        </header>
    )
}

export default Branding