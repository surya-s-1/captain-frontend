'use client'

import { useEffect, useState } from 'react'
import { ConnectedProject } from '@/components/projects'
import { getCurrentUser } from '@/lib/firebase/utilities'

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

interface JiraProjectResponse {
    id: string
    key: string
    name: string
    avatarUrls: object
    uuid: string
    siteId: string
    siteDomain: string
}

interface JiraProject extends JiraProjectResponse {
    connected: boolean
    project_id: string | null
    latest_version: string | null
    imageUrl: string
}

export function useJiraProjects(connectedProjects: ConnectedProject[]) {
    const [fetchedProjects, setFetchedProjects] = useState<JiraProject[]>([])
    const [projects, setProjects] = useState<JiraProject[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    async function fetchProjects() {
        try {
            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/tools/jira/projects/list`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data: JiraProject[] = await response.json()
                setFetchedProjects(data.map((d) => (
                    {
                        ...d,
                        connected: false,
                        project_id: null,
                        latest_version: null,
                        imageUrl: (d.avatarUrls as any)['32x32'] || ''
                    }
                ))
                )
                setLoading(false)
            } else {
                setError('Please reload this page. If the issue persists, please check if you have connected your Jira account and reconnect it.')
                setLoading(false)
            }
        } catch (err) {
            setError('Error fetching Jira projects')
            setLoading(false)
        }
    }

    useEffect(() => {
        const updatedProjects = fetchedProjects.map((project) => {
            const connectedProject = connectedProjects.find((cp) => (cp.tool === 'jira' && cp.toolProjectKey === project.key))

            if (connectedProject) {
                return {
                    ...project, 
                    connected: true, 
                    project_id: connectedProject.project_id,
                    latest_version: connectedProject.latest_version
                }
            }
            return project
        })

        setProjects(updatedProjects)

    }, [fetchedProjects, connectedProjects])

    return { fetchProjects, projects, loading, error }
}
