'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'

import { firestoreDb } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/firebase/utilities'

interface Project {
    tool: string
    project_name: string
    project_id: string
}

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([])

    useEffect(() => {
        async function fetchProjects() {
            const user = await getCurrentUser()
            if (!user) return

            const projectsRef = collection(firestoreDb, 'projects')
            const q = query(projectsRef, where('uid', '==', user.uid))
            const querySnapshot = await getDocs(q)
            const data = querySnapshot.docs.map(doc => doc.data())
            setProjects(data as Project[])
        }
        
        fetchProjects()
    }, [])

    return (
        <div className='flex flex-col items-start p-8 w-full'>
            <h1 className='text-2xl font-bold mb-4'>My Projects</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full'>
                {projects.map((project, idx) => (
                    <a 
                        key={idx} 
                        href={`/projects/versions?projectId=${project.project_id}`}
                        className='border min-h-40 cursor-pointer p-4 rounded-md shadow-md'
                    >
                        <h2 className='text-xl font-semibold'>{project.project_name}</h2>
                        <p className='text-gray-600'>{project.tool}</p>
                    </a>
                ))}
                <a href='/projects/new' className='flex items-center justify-center border min-h-40 cursor-pointer p-4 rounded-md shadow-md'>
                    <p className='text-gray-600'>+ New Project</p>
                </a>
            </div>
        </div>
    )
}
