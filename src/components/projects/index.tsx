'use client'

import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'

import { ProjectView } from '@/components/projects/view'
import { useJiraProjects } from '@/hooks/useJiraProjects'

import { firestoreDb } from '@/lib/firebase'
import { STANDARD_APP_NAME, SUPPORTED_TOOLS } from '@/lib/utility/constants'
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
        const q = query(projectsRef, where('uids', 'array-contains', user.uid))

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data = querySnapshot.docs.map(doc => doc.data())
            setConnectedProjects(data as ConnectedProject[])
        })

        return unsubscribe
    }

    useEffect(() => {
        document.title = 'Projects | ' + STANDARD_APP_NAME

        async function loadProjects() {
            const unsubscribe = await fetchConnectedProjects()
            return () => unsubscribe && unsubscribe()
        }

        loadProjects()
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
                toolName={SUPPORTED_TOOLS.JIRA}
                description='Make sure your projects allow Worktype Task and Summary, Description and Priority fields in the Task. Otherwise, the issue creation might fail on your Jira project.'
                loading={jiraLoading}
                error={jiraError}
                projects={jiraProjects}
            />
        </div>
    )
}
