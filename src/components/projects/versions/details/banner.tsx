'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getDoc, doc, onSnapshot } from 'firebase/firestore'

import { firestoreDb } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/firebase/utilities'

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''
const VALID_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
]

export default function DetailsBanner() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const projectId = searchParams.get('projectId')
    const version = searchParams.get('version')

    const [error, setError] = useState<string>('')
    const [projectName, setProjectName] = useState<string>('')
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
    const [status, setStatus] = useState('')
    const [versionFiles, setVersionFiles] = useState<any[]>([])

    async function fetchProjectName() {
        if (!projectId) {
            router.push('/projects')
            return
        }

        const projectRef = doc(firestoreDb, 'projects', projectId)
        const projectSnap = await getDoc(projectRef)

        if (!projectSnap.exists()) {
            setError('Project not found!')
            setTimeout(() => {
                router.push('/projects')
            }, 2000)
            return
        }

        const projectData = projectSnap.data()
        setProjectName(projectData.toolProjectName)
    }

    async function fetchVersion() {
        const versionDocRef = doc(firestoreDb, 'projects', projectId, 'versions', version)

        const unsubscribe = onSnapshot(versionDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setStatus(data.status || 'Unknown')
                setVersionFiles(data.files || [])
            }
        })

        return () => unsubscribe()
    }

    const handleFileUpload = (e?: React.ChangeEvent<HTMLInputElement>) => {
        if (e && e.target.files) {
            setUploadedFiles([])

            const files = Array.from(e.target.files)
            const maxSize = 30 * 1024 * 1024

            const validFiles = files.filter(file => (file.size <= maxSize && VALID_FILE_TYPES.includes(file.type)))

            if (validFiles.length < files.length) {
                alert('Some files were not uploaded due to type/size restrictions.')
            }

            setUploadedFiles(prev => [...prev, ...validFiles])
        }
    }

    async function handleSubmit() {
        if (uploadedFiles.length > 0 && uploadedFiles.length < 5) {
            const formData = new FormData()
            uploadedFiles.forEach(file => {
                formData.append('files', file)
            })

            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            try {
                const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/${projectId}/v/${version}/docs/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                })

                if (!response.ok) {
                    throw new Error('File upload failed')
                }

                const data = await response.text()
                console.log('Upload successful:', data)
            } catch (error) {
                console.error('Error uploading files:', error)
            }
        }
    }

    useEffect(() => {
        fetchProjectName()
    }, [projectId, version])

    return (
        <div className='w-full h-[150px] sticky top-0 flex gap-40 items-center p-10 bg-gray-500 text-color-primary-contrast'>
            <div>
                <h2 className='text-2xl font-bold'>{projectName}</h2>
                <h4 className='text-sm'>{version}</h4>
                <p>{status}</p>
            </div>
            {versionFiles.length === 0 &&
                <div className='flex flex-col gap-2'>
                    <label htmlFor='files' className='w-fit bg-primary-contrast text-color-primary-contrast rounded-full p-2 cursor-pointer'>
                        Upload Files
                    </label>
                    <input
                        type='file'
                        id='files'
                        multiple
                        required
                        onChange={handleFileUpload}
                        accept='.pdf,.doc,.docx,.xls,.xlsx,.csv'
                        className='hidden'
                    />
                    <div className='flex flex-col gap-2 max-h-[100px] overflow-y-auto scrollbar'>
                        {uploadedFiles.map(file => (
                            <div key={file.name}>
                                {file.name}
                            </div>
                        ))}
                    </div>
                    {uploadedFiles.length > 0 &&
                        <button
                            className='w-fit bg-secondary text-color-secondary rounded-full p-2 mt-2 cursor-pointer'
                            onClick={() => handleSubmit()}
                        >
                            Submit
                        </button>}
                </div>}
            {versionFiles.length > 0 &&
                <div>
                    <h4 className='font-semibold'>Uploaded Files:</h4>
                    <ul>
                        {versionFiles.map(file => (
                            <li
                                key={file.name}
                                className='list-disc ml-5'
                            >
                                {file.name}
                            </li>
                        ))}
                    </ul>
                </div>}
        </div>
    )
}