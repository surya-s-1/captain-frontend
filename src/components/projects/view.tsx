'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { getCurrentUser } from '@/lib/firebase/utilities'

export interface Project {
    name: string
    key: string
    imageUrl: string
    connected: boolean
    siteId: string
    siteDomain: string
    project_id: string | null
    latest_version: string | null
}

interface ProjectViewInput {
    toolName: string
    description: string
    loading: boolean
    error: string | null
    projects: Project[]
}

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

function ProjectCard({ project, toolName }: { project: Project, toolName: string }) {
    const router = useRouter()
    const [connectLoading, setConnectLoading] = useState(false)

    async function connectProject(siteId: string, siteDomain: string, projectName: string, projectKey: string) {
        try {
            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            setConnectLoading(true)

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    tool: toolName.toLowerCase(),
                    siteId,
                    siteDomain,
                    projectName,
                    projectKey
                })
            })

            if (response.ok) {
                console.log(await response.text())
            }

            setConnectLoading(false)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <a
            href={project.connected ? `/projects/versions/details?projectId=${project.project_id}&version=${project.latest_version}` : ''}
            className='flex flex-col justify-between gap-8 cursor-pointer p-4 rounded-md shadow-md hover:shadow-lg transition-shadow dark:shadow-black/50'
        >
            <div className='w-full flex items-center gap-4'>
                <img src={project.imageUrl} className='h-8 rounded-full' />
                <h2 className='text-xl'>{project.name}</h2>
            </div>
            <div className={`w-full flex items-center justify-between ${!project.connected && 'flex-row-reverse'}`}>
                {project.connected ?
                    <>
                        <button
                            className='text-color-primary/80 cursor-pointer font-sans font-semibold'
                            onClick={(e) => {
                                e.preventDefault()
                                router.push(`/projects/versions?projectId=${project.project_id}`)
                            }}
                        >
                            See versions {'>>'}
                        </button>
                        <span
                            className='w-fit text-success p-2'
                        >
                            Connected
                        </span>
                    </> :
                    <button
                        className='flex items-center gap-2 w-fit text-link font-sans font-semibold p-2 cursor-pointer'
                        onClick={(e) => {
                            e.preventDefault()
                            connectProject(
                                project.siteId,
                                project.siteDomain,
                                project.name,
                                project.key
                            )
                        }}
                        disabled={connectLoading}
                    >
                        <span>Connect</span>
                        {connectLoading &&
                            <Loader2 className='animate-spin' size={16} />}
                    </button>
                }
            </div>
        </a>)
}

export function ProjectView({ toolName, description, loading, error, projects }: ProjectViewInput) {
    return (
        <>
            <h2 className='text-color-primary/70 text-lg font-semibold'>{toolName}</h2>
            <p className='text-color-primary/50 italic mb-4'>{description}</p>

            {loading &&
                <div className='flex items-center gap-2'>
                    Loading <Loader2 className='animate-spin' size={20} />
                </div>}

            {error &&
                <div className='text-error font-semibold'>{error}</div>}

            {!loading && !error &&
                <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {projects.map((project, idx) => (
                        <ProjectCard key={idx} project={project} toolName={toolName} />
                    ))}
                </div>
            }
        </>
    )
}