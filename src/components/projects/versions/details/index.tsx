'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore'

import { firestoreDb } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/firebase/utilities'

interface Requirement {
    'requirement_id': string,
    'requirement': string,
    'requirement_type': string,
    'sources': string[],
    'regulations': string[]
}

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

export default function ProjectDetails() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const projectId = searchParams.get('projectId')
    const version = searchParams.get('version')

    const VALID_FILE_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
    ]

    const [error, setError] = useState('')
    const [status, setStatus] = useState('')
    const [projectName, setProjectName] = useState<string>('')
    const [files, setFiles] = useState<any[]>([])
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
    const [requirements, setRequirements] = useState<Requirement[]>([])

    async function fetchRequirements() {
        if (!projectId || !version) {
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

        const versionRef = doc(firestoreDb, 'projects', projectId, 'versions', version)
        const versionSnap = await getDoc(versionRef)

        if (!versionSnap.exists()) {
            setError('Version not found!')
            setTimeout(() => {
                router.push('/projects')
            }, 2000)
            return
        }

        setStatus(versionSnap.data().status)

        const versionFiles = versionSnap.data().files || []
        setFiles(versionFiles)

        const reqQuery = query(
            collection(firestoreDb, 'projects', projectId, 'versions', version, 'requirements'),
            where('deleted', '==', false)
        )

        const reqUnsubscribe = onSnapshot(reqQuery, (snapshot) => {
            const reqsList = snapshot.docs.map(d => ({ ...d.data() })) as Requirement[]
            console.log(reqsList)
            setRequirements(reqsList)
        })

        return () => reqUnsubscribe()
    }

    useEffect(() => {
        const loadData = async () => {
            const unsubscribe = await fetchRequirements()
            return unsubscribe
        }

        loadData()
    }, [projectId, version])

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

    return (
        <div className='w-full'>
            <div className='w-full h-[200px] flex gap-40 items-center p-10 bg-primary-contrast/50 text-color-primary-contrast'>
                <div>
                    <h2 className='text-2xl font-bold'>{projectName}</h2>
                    <h4 className='text-sm'>{version}</h4>
                    <p>{status}</p>
                </div>
                {files.length === 0 &&
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
                {files.length > 0 &&
                    <div>
                        <h4>Uploaded Files:</h4>
                        {files.map(file => (
                            <div key={file.name}>
                                {file.name}
                            </div>
                        ))}
                    </div>}
            </div>
            <h2>Requirements</h2>
            {requirements.length > 0 ? (
                <div className='h-[400px] overflow-y-auto'>
                    {requirements.map(r => (
                        <div
                            key={r.requirement_id}
                            onClick={() => { }}>
                            {r.requirement}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No requirements found.</p>
            )}
        </div>
    )
}