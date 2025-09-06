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
    tool: string
    loading: boolean
    error: string | null
    projects: Project[]
}

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

export function ProjectView({ tool, loading, error, projects }: ProjectViewInput) {
    const router = useRouter()
    const [connectLoading, setConnectLoading] = useState(false)

    async function connectProject(siteId: string, siteDomain: string, projectName: string, projectKey: string) {
        try {
            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            setConnectLoading(true)

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    tool: tool.toLowerCase(),
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
        <>
            <h2 className='text-color-primary/70 text-lg font-semibold mb-4'>{tool}</h2>
            <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {(loading || error) ?
                    <div>
                        {loading ?
                            <div className='flex items-center gap-2'>Loading <Loader2 className='animate-spin' size={20} /></div> :
                            <p className='text-error font-semibold'>{error}</p>}
                    </div> :
                    projects.map((project, idx) => (
                        <a
                            key={idx}
                            href={project.connected ? `/projects/versions/details?projectId=${project.project_id}&version=${project.latest_version}&tool=${tool}` : ''}
                            className='flex flex-col justify-between gap-8 cursor-pointer p-4 rounded-md shadow-md'
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
                                                router.push(`/projects/versions?projectId=${project.project_id}&tool=${tool}`)
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
                                        className='w-fit text-link font-sans font-semibold p-2 cursor-pointer'
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