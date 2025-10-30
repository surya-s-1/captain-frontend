'use client'

import { useState } from 'react'
import { PackagePlus, TriangleAlert, Download, Loader2 } from 'lucide-react'

import { useDownload } from '@/hooks/useDownload'

import { getCurrentUser } from '@/lib/firebase/utilities'
import { VERSION_STATUS } from '@/lib/utility/constants'

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

interface DatasetsProps {
    projectId: string
    version: string
    latestVersion: boolean
    status: string
    testcase_ids: string[]
}

export default function Datasets({ projectId, version, latestVersion, status, testcase_ids }: DatasetsProps) {
    const canDownload = ((VERSION_STATUS?.[status]?.RANK || -1) > VERSION_STATUS['CONFIRM_TESTCASES'].RANK) && latestVersion

    const [createLoading, setCreateLoading] = useState(false)
    const [singleTestcase, setSingleTestcase] = useState('')

    const {
        downloadSingleDataset,
        downloadAllDatasets,
        downloadSingleLoading,
        downloadAllLoading
    } = useDownload(projectId, version)

    if (!canDownload) {
        return (
            <div>Please come back after confirming the created testcases.</div>
        )
    }

    async function createDatasets() {
        try {
            if (!latestVersion) {
                alert('Not allowed in this version')
                return
            }

            setCreateLoading(true)

            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/${projectId}/v/${version}/datasets/create`, {
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

    async function downloadEveryDataset() {
        try {
            if (downloadAllLoading) {
                return
            }

            await downloadAllDatasets()
        } catch (err) {
            console.error(err)
        }
    }

    async function downloadOneDataset() {
        try {
            if (downloadSingleLoading) {
                return
            }

            await downloadSingleDataset(singleTestcase)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className='flex flex-col gap-4 w-full p-4 text-sm font-medium'>
            <button
                className={`flex items-center gap-2 w-fit px-4 py-2 rounded-md shadow-sm shadow-black/30 dark:shadow-black/50 transition-shadow ${createLoading ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
                onClick={createDatasets}
                disabled={createLoading}
            >
                <PackagePlus size={20} />
                <span>Create datasets</span>
                {createLoading && <Loader2 className='animate-spin' size={20} />}
            </button>

            {createLoading &&
                <div className='flex items-center gap-2 text-red-500'>
                    <TriangleAlert size={20} />
                    <span>Please don't leave this tab while starting the datasets creation</span>
                </div>}

            <button
                className={`flex items-center gap-2 w-fit px-4 py-2 rounded-md shadow-sm shadow-black/30 dark:shadow-black/50 transition-shadow ${downloadAllLoading ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
                onClick={() => downloadEveryDataset()}
                disabled={downloadAllLoading}
            >
                <Download size={20} />
                <span>Download all datasets</span>
                {downloadAllLoading && <Loader2 className='animate-spin' size={18} />}
            </button>

            {downloadAllLoading &&
                <div className='flex items-center gap-2 text-red-500'>
                    <TriangleAlert size={20} />
                    <span>Please don't leave this tab while downloading the datasets</span>
                </div>}

            <div className='flex items-center gap-2 w-fit'>
                <span>Download dataset for a testcase:</span>

                <select
                    className='text-sm p-1 border rounded'
                    value={singleTestcase}
                    onChange={(e) => setSingleTestcase(e.target.value)}
                >
                    <option value='' disabled hidden>Select a testcase</option>
                    {testcase_ids.map(id => (
                        <option key={id} value={id}>{id}</option>
                    ))}
                </select>

                <button
                    className={`flex items-center gap-2 w-fit text-sm px-2 py-1 rounded-md shadow-sm shadow-black/30 dark:shadow-black/50 transition-shadow ${downloadAllLoading ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
                    onClick={downloadOneDataset}
                    disabled={downloadSingleLoading}
                >
                    <Download size={20} />
                    {downloadSingleLoading && <Loader2 className='animate-spin' size={20} />}
                </button>
            </div>

            {downloadSingleLoading &&
                <div className='flex items-center gap-2 text-red-500'>
                    <TriangleAlert size={24} />
                    <span>Please don't leave this tab while downloading the dataset</span>
                </div>}
        </div>
    )
}