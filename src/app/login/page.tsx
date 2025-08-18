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
            router.push('/chat')
        }
    }, [])

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider()
            await signInWithPopup(auth, provider)
            router.push('/chat')
        } catch (err) {
            console.error('Login error:', err)
        }
    }

    return (
        <div className='flex flex-col w-full h-full items-center justify-center bg-primary'>
            <div className='flex flex-col gap-8 pb-40'>
                <h1 className='text-5xl text-color-primary'>Login</h1>
                <button
                    onClick={handleGoogleLogin}
                    className='flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-tertiary text-color-secondary/80 hover:text-color-tertiary transition-colors duration-300 cursor-pointer text-lg rounded-lg'
                >
                    <img className='max-h-[24px]' src={Google_Logo.src} />
                    <span>Sign in with Google</span>
                </button>
            </div>
        </div>
    )
}