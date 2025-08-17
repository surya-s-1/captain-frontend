'use client'

import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

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
            <div>
                <h1 className='text-3xl mb-4'>Login</h1>
                <button
                    onClick={handleGoogleLogin}
                    className='px-4 py-2 bg-blue-500 hover:bg-blue-600 transition-colors duration-300 cursor-pointer text-white rounded-lg'
                >
                    Sign in with Google
                </button>
            </div>
        </div>
    )
}