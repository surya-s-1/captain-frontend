'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function NotFound() {
    const router = useRouter()
    const [countdown, setCountdown] = useState(3)

    function redirectPage() {
        router.push('/chat')
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (countdown > 0) {
                setCountdown((prev) => prev - 1)
            }
        }, 1000)

        const timeout = setTimeout(() => {
            redirectPage()
        }, 3000)

        return () => {
            clearInterval(interval)
            clearTimeout(timeout)
        }
    }, [router])

    return (
        <div className='flex items-center justify-center gap-4 h-full mb-48'>
            <div className='text-[60px] border-r-2 px-4 py-2'>
                404
            </div>
            <div>
                <p className='text-2xl'>Page Not Found</p>
                {countdown > 0 &&
                <p className='text-base'>You will be redirected in {countdown} second{countdown !== 1 ? 's' : ''}</p>}
                {countdown < 1 &&
                <p className='text-base'>In case you are not redirected, click <span className='cursor-pointer text-blue-500' onClick={redirectPage}><i>here</i></span></p>}
            </div>
        </div>
    )
}