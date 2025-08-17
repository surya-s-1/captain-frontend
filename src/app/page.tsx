'use client'

import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'

export default function Home() {
    const appUser = useSelector((state: RootState) => state.user)

    return (
        <div className='bg-primary text-color-primary'>
            Hello, {appUser.name}!
        </div>
    )
}