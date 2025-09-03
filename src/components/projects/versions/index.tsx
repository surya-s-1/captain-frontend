'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { collection, getDoc, doc, getDocs, query } from 'firebase/firestore'

import { firestoreDb } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/firebase/utilities'

export default function ProjectVersions() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const projectId = searchParams.get('projectId')
    const [latestVersion, setLatestVersion] = useState('')
    const [versions, setVersions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')


    useEffect(() => {
        setLoading(true)
        
        if (!projectId) {
            router.push('/projects')
            setLoading(false)
            return
        }

        const fetchVersions = async () => {
            const user = await getCurrentUser()
            if (!user) return

            const projectRef = doc(firestoreDb, 'projects', projectId)
            const projectSnap = await getDoc(projectRef)

            if (!projectSnap.exists()) {
                setError('Project not found!')
                setLoading(false)
                setTimeout(() => {
                    router.push('/projects')
                }, 2000)
                return
            }

            const projectData = projectSnap.data()
            setLatestVersion(projectData.latest_version)
            
            const versionsRef = collection(firestoreDb, 'projects', projectId, 'versions')
            const q = query(versionsRef)
            const querySnapshot = await getDocs(q)
            const data = querySnapshot.docs.map(doc => doc.data())
            
            setVersions(data)
            setLoading(false)
        }

        fetchVersions()
    }, [projectId])

    if (loading) {
        return <div>Loading versions...</div>
    }

    if (error) {
        return <div>{error}</div>
    }

    return(
        <div className='flex flex-col items-start w-full p-8 gap-8'>
            <h1 className='text-2xl font-bold'>Project Versions</h1>
            <div className='flex flex-col items-start w-full gap-4'>
                {versions.length > 0 ? (
                    versions.map((ver, ind) => (
                        <a
                            key={ind}
                            href={`/projects/versions/details?projectId=${projectId}&version=${ver.version}`}
                            className='w-[50%] text-color-primary/80 cursor-pointer p-4 rounded-md shadow-md hover:shadow-lg'
                        >
                            {ver.version} <span className='text-color-primary/50'>{ver.version === latestVersion ? '(Latest)' : ''}</span>
                        </a>
                    ))
                ) : (
                    <p>No versions found for this project.</p>
                )}
            </div>
        </div>
    )
}