'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { collection, getDoc, doc, getDocs, query, where } from 'firebase/firestore'

import { firestoreDb } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/firebase/utilities'
import { STANDARD_APP_NAME, SUPPORTED_TOOLS } from '@/lib/utility/constants'


export default function ProjectVersions() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const projectId = searchParams.get('projectId')
    const tool = searchParams.get('tool')

    const [latestVersion, setLatestVersion] = useState('')
    const [versions, setVersions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')


    const fetchVersions = async () => {
        try {
            const user = await getCurrentUser()
            if (!user) return

            const projectRef = doc(firestoreDb, 'projects', projectId)
            const projectSnap = await getDoc(projectRef)

            if (!projectSnap.exists()) {
                setError('Project not found!')
                setLoading(false)
                setTimeout(() => router.push('/projects'), 2000)
                return
            }

            const projectData = projectSnap.data()

            if (!projectData.uids || !projectData.uids.includes(user.uid)) {
                setError('You do not have access to this project.')
                setLoading(false)
                setTimeout(() => router.push('/projects'), 2000)
                return
            }

            setLatestVersion(projectData.latest_version || null)

            const versionsRef = collection(firestoreDb, 'projects', projectId, 'versions')
            const querySnapshot = await getDocs(versionsRef)

            const versions = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }))

            setVersions(versions)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching versions:', err)
            setError('Something went wrong!')
            setLoading(false)
        }
    }

    useEffect(() => {
        document.title = 'Project Versions | ' + STANDARD_APP_NAME
    }, [])

    useEffect(() => {
        setLoading(true)

        if (!projectId || !tool || !Object.values(SUPPORTED_TOOLS).includes(tool)) {
            router.push('/projects')
            setLoading(false)
            return
        }

        fetchVersions()
    }, [projectId])

    if (loading) {
        return <div>Loading versions...</div>
    }

    if (error) {
        return <div className='text-error font-semibold'>{error}</div>
    }

    return (
        <div className='flex flex-col items-start w-full p-8 gap-8'>
            <h1 className='text-2xl font-bold'>Project Versions</h1>
            <div className='flex flex-col items-start w-full gap-4'>
                {versions.length > 0 ? (
                    versions.map((ver, ind) => (
                        <a
                            key={ind}
                            href={`/projects/versions/details?projectId=${projectId}&version=${ver.version}&tool=${tool}`}
                            className='w-[50%] text-color-primary/80 cursor-pointer p-4 rounded-md shadow-md hover:shadow-lg transition-shadow dark:shadow-black/50'
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