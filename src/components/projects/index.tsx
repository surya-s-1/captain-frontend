'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'

import JiraProjects from '@/components/projects/jira'

import { firestoreDb } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/firebase/utilities'

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

export interface Project {
    tool: string,
    tool_project_id: string,
    tool_project_name: string
    project_id: string
}

export default function Projects() {
    const [connectedProjects, setConnectedProjects] = useState<Project[]>([])

    async function fetchConnectedProjects() {
        const user = await getCurrentUser()
        if (!user) return

        const projectsRef = collection(firestoreDb, 'projects')
        const q = query(projectsRef, where('uid', '==', user.uid))
        const querySnapshot = await getDocs(q)
        const data = querySnapshot.docs.map(doc => doc.data())
        setConnectedProjects(data as Project[])
    }

    useEffect(() => {
        fetchConnectedProjects()
    }, [])

    return (
        <div className='w-full flex flex-col items-start p-8'>
            <JiraProjects connectedProjects={connectedProjects} />
        </div>
    )
}
