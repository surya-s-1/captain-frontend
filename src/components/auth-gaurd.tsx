'use client'

import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter, usePathname } from 'next/navigation'

import { RootState } from '@/lib/store'
import { PUBLIC_PATHS } from '@/lib/utility/constants'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { uid, loading } = useSelector((state: RootState) => state.user)

    useEffect(() => {
        if (!loading && !uid && !PUBLIC_PATHS.includes(pathname)) {
            router.replace('/login')
        }
    }, [uid, loading, pathname, router])

    if (loading) {
        return <div className='flex items-center justify-center h-screen'>Loading...</div>
    }

    return <>{children}</>
}