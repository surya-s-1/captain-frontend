'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'

import { firestoreDb } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/firebase/utilities'

import { Project } from '@/components/projects'

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

export default function JiraProjects({ connectedProjects }: { connectedProjects: Project[] }) {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)

    async function fetchJiraProjects() {
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
            const data = await response.json()
            setProjects(data.map((d: any) => ({ ...d, connected: false, project_id: null })))
            setLoading(false)
        } else {
            console.error('Error fetching Jira projects')
        }
    }

    useEffect(() => {
        fetchJiraProjects()
    }, [])

    useEffect(() => {
        if (projects.length === 0 || connectedProjects.length === 0) return

        const updatedProjects = projects.map(project => {
            const connected = connectedProjects.find(p => p.tool_project_id === project.id)
            return {
                ...project,
                connected: !!connected,
                project_id: connected ? connected.project_id : null
            }
        })

        setProjects(updatedProjects)
    }, [connectedProjects])

    return (
        <div className='w-full flex flex-col items-start p-8'>
            <h2 className='text-color-primary/70 text-lg font-semibold mb-4'>Jira</h2>
            <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {loading && 'Loading...'}
                {!loading && projects?.map((project, idx) => (
                    <a
                        key={idx}
                        href={project?.project_id && `/projects/versions?projectId=${project?.project_id}`}
                        className='flex flex-col justify-between gap-8 border cursor-pointer p-4 rounded-md shadow-md'
                    >
                        <h2 className='text-xl font-semibold'>{project?.name}</h2>
                        {
                            project?.connected ? (
                                <span
                                    className='w-fit bg-green-200 text-green-600 p-2'
                                >
                                    Connected
                                </span>
                            ) : (
                                <button
                                    className='w-fit bg-blue-200 text-blue-600 p-2 cursor-pointer'
                                    onClick={(e) => {
                                        e.preventDefault()
                                    }}
                                >
                                    Connect
                                </button>
                            )
                        }
                    </a>
                ))}
            </div>
        </div>
    )
}
