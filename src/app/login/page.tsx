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
        <div className='flex flex-col lg:flex-row w-full min-h-screen items-center bg-gray-50'>
            <div className='flex flex-col items-center justify-center w-full lg:w-1/2 min-h-[300px] lg:min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg'>
                <div className='text-center'>
                    <h1 className='text-5xl lg:text-7xl font-extrabold tracking-tight'>
                        Get.<br />
                        Set.<br />
                        Go.
                    </h1>
                    <p className='mt-4 text-xl lg:text-2xl font-light text-white/90'>
                        Captain's here to assist.
                    </p>
                </div>
            </div>

            <div className='flex flex-col w-full lg:w-1/2 items-center justify-center p-8 lg:p-12'>
                <div className='w-full max-w-sm p-8 bg-white rounded-xl shadow-2xl transition-transform transform hover:scale-105'>
                    <h2 className='text-3xl font-bold text-center text-gray-800 mb-6'>
                        Welcome
                    </h2>
                    <p className='text-center text-gray-500 mb-8'>
                        Sign in to continue to your projects.
                    </p>
                    <button
                        onClick={handleGoogleLogin}
                        className='w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg shadow-md hover:bg-gray-200 transition-colors cursor-pointer'
                    >
                        <img className='h-6 w-6' src={Google_Logo.src} alt="Google Logo" />
                        <span>Sign in with Google</span>
                    </button>
                </div>
            </div>
        </div>
    )
}