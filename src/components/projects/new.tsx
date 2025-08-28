'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const MODEL_ENDPOINT = process.env.NEXT_PUBLIC_MODEL_ENDPOINT

export default function NewProjectForm() {
    const router = useRouter()
    const [projectName, setProjectName] = useState('')
    const [jiraKey, setJiraKey] = useState('')
    const [files, setFiles] = useState<File[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(Array.from(event.target.files))
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData()
        formData.append('tool', 'jira')
        formData.append('projectName', projectName)
        formData.append('projectId', jiraKey)
        files.forEach((file) => {
            formData.append('files', file)
        })

        try {
            const response = await fetch(`/${MODEL_ENDPOINT}/projects/create`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to create project')
            }

            router.push('/projects')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-4 p-4 border rounded-lg shadow-md'>
            {error && <div className='text-red-500 text-sm'>{error}</div>}
            <div>
                <label htmlFor='projectName' className='block text-sm font-medium text-gray-700'>
                    Project Name
                </label>
                <input
                    type='text'
                    id='projectName'
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline'
                />
            </div>
            <div>
                <label htmlFor='jiraKey' className='block text-sm font-medium text-gray-700'>
                    Jira Project Key
                </label>
                <input
                    type='text'
                    id='jiraKey'
                    value={jiraKey}
                    required
                    onChange={(e) => setJiraKey(e.target.value)}
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline'
                />
            </div>
            <div>
                <label htmlFor='files' className='block text-sm font-medium text-gray-700'>
                    Upload Functional Specifications & User Journeys
                </label>
                <input
                    type='file'
                    id='files'
                    multiple
                    required
                    onChange={handleFileChange}
                    className='mt-1 block w-full text-sm text-color-primary-500
                                file:py-2 file:px-4 file:rounded-full file:cursor-pointer
                                file:bg-primary-contrast file:text-color-primary-contrast
                                hover:file:bg-color-primary/80'
                />
            </div>
            <button
                type='submit'
                disabled={loading}
                className='w-full flex justify-center py-2 px-4 rounded-md text-color-primary-contrast bg-primary-contrast hover:bg-primary-contrast/80 disabled:opacity-50'
            >
                {loading ? 'Creating...' : 'Create Project'}
            </button>
        </form>
    )
}