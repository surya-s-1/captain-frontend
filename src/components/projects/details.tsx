'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ProjectDetails() {
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const projectId = searchParams.get('projectId')
        const version = searchParams.get('version')

        if (!projectId || !version) {
            router.push('/projects')
        }
    }, [searchParams, router])

    return <></>
}