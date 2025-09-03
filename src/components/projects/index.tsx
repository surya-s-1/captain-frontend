'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'

import { ProjectView } from '@/components/projects/view'
import { useJiraProjects } from '@/hooks/useJiraProjects'

import { firestoreDb } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/firebase/utilities'

export interface ConnectedProject {
    project_id: string
    latest_version: string | null
    tool: string
    toolProjectKey: string
    toolProjectName: string
}

export default function Projects() {
    const [connectedProjects, setConnectedProjects] = useState<ConnectedProject[]>([])

    async function fetchConnectedProjects() {
        const user = await getCurrentUser()
        if (!user) return

        const projectsRef = collection(firestoreDb, 'projects')
        const q = query(projectsRef, where('uid', '==', user.uid))
        const querySnapshot = await getDocs(q)
        const data = querySnapshot.docs.map(doc => doc.data())
        setConnectedProjects(data as ConnectedProject[])
    }

    useEffect(() => {
        fetchConnectedProjects()
    }, [])

    const { projects: jiraProjects, loading: jiraLoading, error: jiraError } = useJiraProjects(connectedProjects)

    return (
        <div className='w-full flex flex-col items-start p-8'>
            <ProjectView
                tool='Jira'
                loading={jiraLoading}
                error={jiraError}
                projects={jiraProjects}
            />
        </div>
    )
}
