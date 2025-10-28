'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowDownToLine, Dot, Loader2 } from 'lucide-react'

import { Modal } from '@/lib/utility/ui/Modal'

import { STANDARD_APP_NAME, VERSION_STATUS } from '@/lib/utility/constants'
import { getCurrentUser } from '@/lib/firebase/utilities'
import { useDownload } from '@/hooks/useDownload'

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''
const VALID_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
]

interface UploadedFileProps {
    projectId: string
    version: string
    documentName: string
}

function UploadedFile({ projectId, version, documentName }: UploadedFileProps) {
    const { downloadDocLoading, downloadUploadedDocument } = useDownload(projectId, version)

    return (
        <div
            className='flex items-center gap-2'
            onClick={() => !downloadDocLoading && downloadUploadedDocument(documentName)}
        >
            <Dot />
            <span>{documentName}</span>
            <button className={downloadDocLoading ? 'cursor-not-allowed' : 'cursor-pointer'}>
                {downloadDocLoading ?
                    <Loader2 className='animate-spin' size={18} /> :
                    <ArrowDownToLine size={18} />}
            </button>
        </div>
    )
}

interface BannerProps {
    projectName: string
    latestVersion: boolean
    versionFiles: string[]
    status: string
}

export default function DetailsBanner({ projectName, latestVersion, versionFiles, status }: BannerProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const projectId = searchParams.get('projectId')
    const version = searchParams.get('version')

    const [error, setError] = useState<string>('')
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
    const [submitLoading, setSubmitLoading] = useState(false)
    const [createVersionLoading, setCreateVersionLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        if (projectName) {
            document.title = (projectName ? projectName + ' ' : '') + 'Details | ' + STANDARD_APP_NAME
        }
    }, [projectName])

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

            uploadedFiles.forEach(file => {
                formData.append('files', file)
            })

            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            try {
                const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/${projectId}/v/${version}/docs/upload`, {
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

    async function createNewVersion() {
        try {
            if (createVersionLoading) return

            setCreateVersionLoading(true)

            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/${projectId}/v/${version}/createNewVersion`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Could not create new version')
            } else {
                const newVersion = await response.text()

                router.push(`/projects/versions/details?projectId=${projectId}&version=${newVersion}`)
            }

            setCreateVersionLoading(false)
        } catch (err) {
            console.error(err)
            setCreateVersionLoading(false)
        }
    }

    return (
        <div className='w-full h-[150px] flex items-center justify-between sticky top-0 p-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white z-20'>
            {projectName &&
                <>
                    <div>
                        <h2 className='text-2xl font-bold'>{projectName}</h2>
                        <h4 className='text-sm'>Version: {version}</h4>
                        <div className='flex items-center gap-2 mt-2'>
                            Status: {VERSION_STATUS?.[status]?.MESSAGE || status}
                            {VERSION_STATUS?.[status]?.LOADER && <Loader2 className='animate-spin' size={20} />}
                        </div>
                    </div>
                    {(versionFiles.length === 0 ||
                        (status.startsWith('ERR_') && VERSION_STATUS?.[status]?.ALLOW_REUPLOAD)) && (
                            <div>
                                <button
                                    className='w-fit bg-primary-contrast text-color-primary-contrast rounded-full p-2 cursor-pointer'
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    {version === '1' ? 'Upload Documents' : 'Upload Updated Requirements'} {status.startsWith('ERR_') && <span>(Retry)</span>}
                                </button>
                                <Modal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)}>
                                    <h2 className='text-xl font-bold mb-4'>
                                        Upload Documents
                                    </h2>
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
                    {versionFiles.length > 0 &&
                        <div>
                            <h4 className='font-semibold'>
                                Uploaded Files:
                            </h4>
                            {versionFiles.map((fileName, idx) => (
                                <UploadedFile
                                    key={idx}
                                    projectId={projectId}
                                    version={version}
                                    documentName={fileName}
                                />
                            ))}
                        </div>}
                    {versionFiles.length > 0
                        && status !== 'CREATED'
                        && !VERSION_STATUS?.[status]?.LOADER
                        && latestVersion
                        && (
                            <div className='flex flex-col items-center gap-1'>
                                <span>Change in requirements?</span>
                                <button
                                    className='w-fit bg-primary-contrast text-color-primary-contrast rounded-full p-2 cursor-pointer flex items-center gap-2'
                                    onClick={() => createNewVersion()}
                                >
                                    Create New Version
                                    {createVersionLoading && <Loader2 className='animate-spin' />}
                                </button>
                            </div>
                        )}
                </>}
        </div>
    )
}