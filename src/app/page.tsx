'use client'

import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'

export default function Home() {
    const appUser = useSelector((state: RootState) => state.user)

    return (
        <div className='flex flex-col w-full h-full items-center justify-center bg-primary'>
            <div className='bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent text-7xl pb-40'>
                {appUser.name ?
                    <>
                        Hello,<br />
                        {appUser.name}!
                    </>
                    :
                    'Hello!'}
            </div>
            <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-4'>
                    <p>Want to connect your account?</p>
                    <a
                        href='/integrations'
                        className='text-blue-500 cursor-pointer'
                    >
                        Click here
                    </a>
                </div>
                <div className='flex items-center gap-4'>
                    <p>Like to see your projects?</p>
                    <a
                        href='/projects'
                        className='text-blue-500 cursor-pointer'
                    >
                        Click here
                    </a>
                </div>
                <div className='flex items-center gap-4'>
                    <p>Want to ask <span className='bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent'>Captain</span> to do it for you?</p>
                    <a
                        href='/ask-captain'
                        className='text-blue-500 cursor-pointer'
                    >
                        Click here
                    </a>
                </div>
            </div>
        </div>
    )
}