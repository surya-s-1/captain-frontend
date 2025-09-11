'use client'

import { getCurrentUser } from '@/lib/firebase/utilities'

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

export const useDownloadDatasets = (projectId: string, version: string) => {
    const pollJobStatus = async (jobId) => {
        const POLLING_INTERVAL = 2000

        const interval = setInterval(async () => {
            try {
                const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/download/status/${jobId}`)
                const contentType = response.headers.get('content-type')

                if (response.status === 200 && contentType?.includes('application/zip')) {
                    clearInterval(interval)

                    const blob = await response.blob()
                    const url = window.URL.createObjectURL(blob)

                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${jobId}.zip`
                    document.body.appendChild(a)
                    a.click()

                    window.URL.revokeObjectURL(url)
                    a.remove()
                } else {
                    const data = await response.json()
                    if (data.status === 'in_progress') {
                        console.log('Download is in progress...')
                    } else if (data.status === 'failed') {
                        clearInterval(interval)
                        console.error('Download failed.')
                        alert('Download failed. Please check the logs.')
                    }
                }
            } catch (error) {
                clearInterval(interval)
                console.error('Network error during polling:', error)
                alert('A network error occurred.')
            }
        }, POLLING_INTERVAL)
    }

    const downloadSingleDataset = async (testcaseId: string) => {
        try {
            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/download/async`, {
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

            pollJobStatus(jobId)

        } catch (error) {
            console.error('Error:', error)
            alert('Failed to start download. Please try again.')
        }
    }

    return { downloadSingleDataset }
}
