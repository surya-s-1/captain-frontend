'use client'

import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'

import { ProjectView } from '@/components/projects/view'
import { useJiraProjects } from '@/hooks/useJiraProjects'

import { firestoreDb } from '@/lib/firebase'
import { SUPPORTED_TOOLS } from '@/lib/utility/constants'

export interface ConnectedProject {
    project_id: string
    latest_version: string | null
    tool: string
    toolProjectKey: string
    toolProjectName: string
}

export default function Projects() {
    const [connectedProjects, setConnectedProjects] = useState<ConnectedProject[]>([])

    const fetchConnectedProjects = () => {
        const projectsRef = collection(firestoreDb, 'projects')
        const q = query(projectsRef)

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data = querySnapshot.docs.map(doc => doc.data())
            setConnectedProjects(data as ConnectedProject[])
        })

        return unsubscribe
    }

    useEffect(() => {
        const unsubscribe = fetchConnectedProjects()
        return () => unsubscribe && unsubscribe()
    }, [])

    const { 
        fetchProjects: fetchJiraProjects, 
        projects: jiraProjects, 
        loading: jiraLoading, 
        error: jiraError 
    } = useJiraProjects(connectedProjects)

    useEffect(() => {
        fetchJiraProjects()
    }, [connectedProjects])

    return (
        <div className='w-full flex flex-col items-start p-8'>
            <ProjectView
                tool={SUPPORTED_TOOLS.JIRA}
                loading={jiraLoading}
                error={jiraError}
                projects={jiraProjects}
            />
        </div>
    )
}
