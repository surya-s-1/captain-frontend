'use client'

import { useState } from 'react'
import { PackagePlus, TriangleAlert, Download, Loader2 } from 'lucide-react'

import { getCurrentUser } from '@/lib/firebase/utilities'
import { VERSION_STATUS_RANK } from '@/lib/utility/constants'

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

interface DatasetsProps {
    projectId: string
    version: string
    status: string
    testcase_ids: string[]
}

export default function Datasets({ projectId, version, status, testcase_ids }: DatasetsProps) {
    const canDownload = (VERSION_STATUS_RANK[status] || -1) >= VERSION_STATUS_RANK['COMPLETE_TESTCASE_CREATION']

    const [createLoading, setCreateLoading] = useState(false)
    const [downloadAllLoading, setDownloadAllLoading] = useState(false)
    const [downloadOneLoading, setDownloadOneLoading] = useState(false)
    const [singleTestcase, setSingleTestcase] = useState('')

    if (!canDownload) {
        return (
            <div>Please come back after all the testcases are created.</div>
        )
    }

    async function getToken() {
        const user = await getCurrentUser()
        if (!user) return null

        const token = await user.getIdToken()
        if (!token) return null

        return token
    }

    async function createDatasets() {
        try {
            setCreateLoading(true)

            const token = await getToken()
            if (!token) return

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/${projectId}/v/${version}/datasets/create`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!response.ok) console.error('Could not create datasets')
        } catch (err) {
            console.error(err)
        } finally {
            setCreateLoading(false)
        }
    }

    async function downloadAllDatasets() {
        try {
            setDownloadAllLoading(true)

            const token = await getToken()
            if (!token) return

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/${projectId}/v/${version}/datasets/download/all`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!response.ok) console.error('Could not download datasets')
        } catch (err) {
            console.error(err)
        } finally {
            setDownloadAllLoading(false)
        }
    }

    async function downloadOneDataset() {
        try {
            setDownloadOneLoading(true)

            const token = await getToken()
            if (!token) return

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/${projectId}/v/${version}/datasets/download/${singleTestcase}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!response.ok) console.error('Could not download dataset')
        } catch (err) {
            console.error(err)
        } finally {
            setDownloadOneLoading(false)
        }
    }

    return (
        <div className='flex flex-col gap-4 w-full p-4'>
            <button
                className={`flex items-center gap-2 w-fit px-4 py-2 rounded-md shadow-sm hover:shadow-md shadow-black/30 dark:shadow-black/50 transition-shadow ${createLoading ? '' : 'cursor-pointer'}`}
                onClick={createDatasets}
                disabled={createLoading}
            >
                <PackagePlus size={24} />
                <span>Create datasets</span>
                {createLoading && <Loader2 className='animate-spin' size={20} />}
            </button>

            {createLoading &&
                <div className='flex items-center gap-2 text-red-500'>
                    <TriangleAlert size={24} />
                    <span>Please don't leave this tab while we are starting the datasets creation</span>
                </div>}

            <button
                className={`flex items-center gap-2 w-fit px-4 py-2 rounded-md shadow-sm hover:shadow-md shadow-black/30 dark:shadow-black/50 transition-shadow ${downloadAllLoading ? '' : 'cursor-pointer'}`}
                onClick={downloadAllDatasets}
                disabled={downloadAllLoading}
            >
                <Download size={24} />
                <span>Download all datasets</span>
                {downloadAllLoading && <Loader2 className='animate-spin' size={20} />}
            </button>

            <div className='flex items-center gap-2 w-fit'>
                <span>Download dataset for testcase:</span>

                <select className='text-sm p-1 border rounded' value={singleTestcase} onChange={(e) => setSingleTestcase(e.target.value)}>
                    <option value='' disabled hidden>Select a testcase</option>
                    {testcase_ids.map(id => (
                        <option key={id} value={id}>{id}</option>
                    ))}
                </select>

                <button
                    className={`flex items-center gap-2 w-fit text-sm px-2 py-1 rounded-md shadow-sm hover:shadow-md shadow-black/30 dark:shadow-black/50 transition-shadow ${downloadAllLoading ? '' : 'cursor-pointer'}`}
                    onClick={downloadOneDataset}
                    disabled={downloadOneLoading}
                >
                    <Download size={20} />
                    {downloadOneLoading && <Loader2 className='animate-spin' size={20} />}
                </button>
            </div>
        </div>
    )
}