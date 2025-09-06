'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { doc, onSnapshot } from 'firebase/firestore'

import { Modal } from '@/lib/utility/ui/Modal'

import { STANDARD_APP_NAME, STATUS_MESSAGES, STATUS_SHOW_LOADER } from '@/lib/utility/constants'
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
    const [manualVerification, setManualVerification] = useState<boolean>(true)
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
    const [status, setStatus] = useState('')
    const [versionFiles, setVersionFiles] = useState<any[]>([])
    const [submitLoading, setSubmitLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        if (projectName) {
            document.title = `${projectName} | ${STANDARD_APP_NAME}`
        }
    }, [projectName])

    async function fetchProjectName() {
        if (!projectId) {
            router.push('/projects')
            return
        }

        const projectRef = doc(firestoreDb, 'projects', projectId)

        const unsubscribe = onSnapshot(projectRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data()
                setProjectName(data.toolProjectName || '')
            } else {
                setError('Project not found!')
                setTimeout(() => {
                    router.push('/projects')
                }, 2000)
                return
            }
        })

        return () => unsubscribe()
    }

    async function fetchVersion() {
        if (!projectId || !version) {
            router.push('/projects')
            return
        }

        const versionDocRef = doc(firestoreDb, 'projects', projectId, 'versions', version)

        const unsubscribe = onSnapshot(versionDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data()
                setStatus(data.status || 'Unknown')
                setVersionFiles(data.files || [])
            } else {
                setError('Version not found!')
                setTimeout(() => {
                    router.push('/projects')
                }, 2000)
                return
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

            if ((validFiles.length < files.length) || (validFiles.length > 5)) {
                alert('You can upload only 5 files each upto 30 MB')
                return
            }

            setUploadedFiles(prev => [...prev, ...validFiles])
        }
    }

    async function handleSubmit() {
        if (uploadedFiles.length > 0 && uploadedFiles.length <= 5 && !submitLoading) {

            setSubmitLoading(true)

            const formData = new FormData()

            formData.append('manual_verification', String(manualVerification))

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

                setSubmitLoading(false)
                setIsModalOpen(false)
                setUploadedFiles([])

            } catch (error) {
                console.error('Error uploading files:', error)

                setError('Error uploading files. Please try again.')
                setSubmitLoading(false)
                setIsModalOpen(false)
                setUploadedFiles([])
            }
        }
    }

    useEffect(() => {
        fetchProjectName()
        fetchVersion()
    }, [projectId, version])

    return (
        <div className='w-full h-[150px] flex items-center justify-between sticky top-0 p-10 bg-gray-500 text-color-primary-contrast z-10'>
            {projectName &&
                <>
                    <div>
                        <h2 className='text-2xl font-bold'>{projectName}</h2>
                        <h4 className='text-sm'>Version: {version}</h4>
                        <div className='flex items-center gap-2 mt-2'>
                            Status: {STATUS_MESSAGES[status] || status}
                            {STATUS_SHOW_LOADER[status] && <Loader2 className='animate-spin' size={20} />}
                        </div>
                    </div>
                    {(versionFiles.length === 0 || status.startsWith('ERR')) && (
                        <div>
                            <button
                                className='w-fit bg-primary-contrast text-color-primary-contrast rounded-full p-2 cursor-pointer'
                                onClick={() => setIsModalOpen(true)}
                            >
                                Upload Requirements {status.startsWith('ERR') && <span>(Retry)</span>}
                            </button>
                            <Modal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)}>
                                <h2 className='text-xl font-bold mb-4'>Upload Requirements</h2>
                                <div className='flex flex-col gap-4'>
                                    <label htmlFor='files' className='w-fit bg-primary-contrast text-color-primary-contrast rounded-full p-2 cursor-pointer'>
                                        Select Files
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
                                    <div className='flex items-center gap-2'>
                                        <input
                                            type='checkbox'
                                            id='manualVerification'
                                            checked={manualVerification}
                                            onChange={(e) => setManualVerification(e.target.checked)}
                                        />
                                        <label htmlFor='manualVerification'>Manual Verification</label>
                                    </div>
                                    {uploadedFiles.length > 0 &&
                                        <button
                                            className={`w-fit bg-primary-contrast text-color-primary-contrast rounded-full p-2 mt-2 cursor-pointer ${submitLoading && 'bg-primary-contrast/50'}`}
                                            onClick={() => handleSubmit()}
                                            disabled={submitLoading}
                                        >
                                            Submit
                                        </button>}
                                </div>
                            </Modal>
                        </div>)}
                    {versionFiles.length > 0 && !status.startsWith('ERR') &&
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
                </>}
        </div>
    )
}