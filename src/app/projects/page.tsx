'use client'

import { useEffect, useState } from 'react'

const MODEL_ENDPOINT = process.env.NEXT_PUBLIC_MODEL_ENDPOINT

interface Project {
    tool: string
    projectName: string
    projectId: string
}

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([])

    useEffect(() => {
        async function fetchProjects() {
            const response = await fetch(`${MODEL_ENDPOINT}/projects/list`)
            
            if (response.ok) {
                const data = await response.json()
                setProjects(data)
            } else {
                console.error('Failed to fetch projects')
            }
        }
        fetchProjects()
    }, [])

    return (
        <div className='flex flex-col items-start p-8 w-full'>
            <div className='flex justify-end mb-4 w-full'>
                <a
                    href='/projects/new'
                    className='bg-primary-contrast text-color-primary-contrast hover:bg-primary-contrast/80 transition-colors cursor-pointer px-4 py-2 rounded-md'
                >
                    New Project
                </a>
            </div>
            <h1 className='text-2xl font-bold mb-4'>My Projects</h1>
            {projects.length === 0 ? (
                <p>No projects found. Create a new one!</p>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {projects.map((project) => (
                        <div key={project.projectId} className='border p-4 rounded-md shadow-md'>
                            <h2 className='text-xl font-semibold'>{project.projectName}</h2>
                            <p className='text-gray-600'>{project.tool}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
