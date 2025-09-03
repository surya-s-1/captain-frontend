'use client'

import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/firebase/utilities'

export interface Project {
    name: string
    key: string
    connected: boolean
    project_id: string | null
    latest_version: string | null
}

interface ProjectViewInput {
    tool: string
    loading: boolean
    error: string | null
    projects: Project[]
}

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

export function ProjectView({ tool, loading, error, projects }: ProjectViewInput) {
    const router = useRouter()
    
    async function connectProject(projectName: string, projectKey: string) {
        try {
            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    tool: tool.toLowerCase(),
                    projectName,
                    projectKey
                })
            })

            if (response.ok) {
                console.log(await response.text())
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            <h2 className='text-color-primary/70 text-lg font-semibold mb-4'>{tool}</h2>
            <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {(loading || error) ?
                    <div>
                        {loading ?
                            <p>Loading...</p> :
                            <p className='text-error font-semibold'>{error}</p>}
                    </div> :
                    projects.map((project, idx) => (
                        <a
                            key={idx}
                            href={project.connected ? `/projects/versions?projectId=${project.project_id}&version=${project.latest_version}` : ''}
                            className='flex flex-col justify-between gap-8 cursor-pointer p-4 rounded-md shadow-md'
                        >
                            <h2 className='text-xl'>{project.name}</h2>
                            <div className={`w-full flex items-center justify-between ${!project.connected && 'flex-row-reverse'}`}>
                                {project.connected ?
                                <>
                                    <button
                                        onClick={() => {
                                            router.push(`/projects/versions?projectId=${project.project_id}`)
                                        }}
                                    >
                                        See versions
                                    </button>
                                    <span
                                        className='w-fit text-success p-2'
                                    >
                                        Connected
                                    </span>
                                </>:
                                <button
                                    className='w-fit text-link font-sans font-semibold p-2 cursor-pointer'
                                    onClick={(e) => {
                                        e.preventDefault()
                                        connectProject(project.name, project.key)
                                    }}
                                >
                                    Connect
                                </button>
                                }
                            </div>
                        </a>
                    ))}
            </div>
        </>
    )
}