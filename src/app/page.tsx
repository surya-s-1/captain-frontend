'use client'

import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'

export default function Home() {
    const appUser = useSelector((state: RootState) => state.user)

    return (
        <div className='flex w-full h-full items-center justify-center bg-primary text-color-primary/50 text-7xl pb-52'>
            {appUser.name ?
                <div>
                    Hello,<br />
                    {appUser.name}!
                </div> :
                'Hello!'}
        </div>
    )
}