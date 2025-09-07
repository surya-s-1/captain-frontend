'use client'

import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

import Google_Logo from '@/../public/Google_Logo.png'

import { auth } from '@/lib/firebase'
import { RootState } from '@/lib/store'

export default function LoginPage() {
    const router = useRouter()
    const appUser = useSelector((state: RootState) => state.user)

    useEffect(() => {
        if (appUser.uid) {
            router.push('/projects')
        }
    }, [])

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider()
            await signInWithPopup(auth, provider)
            router.push('/projects')
        } catch (err) {
            console.error('Login error:', err)
        }
    }

    return (
        <div className='flex flex-col lg:flex-row w-full h-full items-center justify-evenly bg-primary pb-20 lg:pb-40 pt-10 lg:pt-0'>
            <div className='flex flex-col items-center gap-4 lg:gap-8 w-full lg:w-[40%]'>
                <div className='text-4xl lg:text-8xl font-bold'>
                    Get.<br />
                    Set.<br />
                    Go.<br />
                </div>
            </div>
            <div className='flex flex-col w-full lg:w-[60%] mt-10 lg:mt-0 items-center lg:items-start'>
                <div className='flex flex-col gap-4 lg:gap-8 w-fit px-5 lg:pl-20'>
                    <h1 className='text-4xl lg:text-5xl text-color-primary/50'>Login</h1>
                    <button
                        onClick={handleGoogleLogin}
                        className='flex items-center justify-center lg:justify-start gap-2 px-4 py-2 bg-secondary hover:bg-tertiary text-color-secondary/80 hover:text-color-tertiary transition-colors duration-300 cursor-pointer text-lg rounded-lg'
                    >
                        <img className='max-h-[24px]' src={Google_Logo.src} />
                        <span>Sign in with Google</span>
                    </button>
                </div>
            </div>
        </div>
    )
}