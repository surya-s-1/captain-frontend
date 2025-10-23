'use client'

import { useState } from 'react'
import { getCurrentUser } from '@/lib/firebase/utilities'

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

export const useDownloadDatasets = (projectId: string, version: string) => {
    const [downloadSingleLoading, setDownloadSingleLoading] = useState(false)
    const [downloadAllLoading, setDownloadAllLoading] = useState(false)

    const pollJobStatus = async (jobId: string, downloadName: string | null = null, jobEndCallback: Function | null = null) => {
        const POLLING_INTERVAL = 2000

        const interval = setInterval(async () => {
            try {
                const user = await getCurrentUser()
                if (!user) return

                const token = await user.getIdToken()
                if (!token) return

                const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/download/status/${jobId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                const contentType = response.headers.get('content-type')

                if (response.status === 500) {
                    clearInterval(interval)
                    jobEndCallback && jobEndCallback()
                    alert('Unable to download')
                    return
                }

                if (response.status === 200 && contentType?.includes('application/zip')) {
                    const blob = await response.blob()
                    const url = window.URL.createObjectURL(blob)

                    const a = document.createElement('a')
                    a.href = url
                    a.download = downloadName ? `${downloadName}.zip` : `v_${version}_project_${projectId}.zip`
                    document.body.appendChild(a)
                    a.click()

                    window.URL.revokeObjectURL(url)
                    a.remove()

                    clearInterval(interval)
                    jobEndCallback && jobEndCallback()
                    alert('Downloaded!')
                    return
                } else {
                    const data = await response.json()

                    if (data.status === 'in_progress') {
                        console.log('Download is in progress...')

                    } else if (data.status === 'failed') {
                        clearInterval(interval)
                        jobEndCallback && jobEndCallback()
                        alert('Download failed.')
                        return
                    }
                }
            } catch (error) {
                console.error('Error during polling:', error)

                clearInterval(interval)
                jobEndCallback && jobEndCallback()
                alert('An error occurred.')
                return
            }
        }, POLLING_INTERVAL)
    }

    const downloadSingleDataset = async (testcaseId: string) => {
        try {
            if (downloadSingleLoading) {
                return
            }

            setDownloadSingleLoading(true)

            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/download/one`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    project_id: projectId,
                    version: version,
                    testcase_id: testcaseId,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to start download job')
            }

            const data = await response.json()
            const jobId = data.job_id
            console.log(`Job started with ID: ${jobId}`)

            pollJobStatus(jobId, testcaseId, () => {
                setDownloadSingleLoading(false)
            })

        } catch (error) {
            console.error('Error:', error)
            alert('Failed to start download. Please try again.')
            setDownloadSingleLoading(false)
        }
    }

    const downloadAllDatasets = async () => {
        try {
            if (downloadAllLoading) {
                return
            }

            setDownloadAllLoading(true)

            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/download/all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    project_id: projectId,
                    version: version
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to start download job')
            }

            const data = await response.json()
            const jobId = data.job_id
            console.log(`Job started with ID: ${jobId}`)

            pollJobStatus(jobId, null, () => {
                setDownloadAllLoading(false)
            })
        } catch (err) {
            console.error('Error:', err)
            alert('Failed to start download. Please try again.')
        }
    }

    return {
        downloadSingleDataset,
        downloadAllDatasets,
        downloadSingleLoading,
        downloadAllLoading
    }
}
