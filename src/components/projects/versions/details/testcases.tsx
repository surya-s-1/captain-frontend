'use client'

import { useState } from 'react'
import { MoveUpRight, TriangleAlert, ArrowDownToLine, Loader2 } from 'lucide-react'

import { useDownloadDatasets } from '@/hooks/useDownloadDatasets'

import { getCurrentUser } from '@/lib/firebase/utilities'
import { Markdown } from '@/lib/utility/ui/Markdown'
import { TC_DATASET_STATUS_MESSAGES } from '@/lib/utility/constants'

import JIRA_ICON from '@/../public/Jira_icon.png'

export interface TestCaseInterface {
    testcase_id: string
    title: string
    description: string
    acceptance_criteria: string
    priority: string
    requirement_id: string
    deleted: boolean
    toolCreated: string | null
    toolIssueLink: string
    dataset_status: string | null
    datasets: string[] | null
}

interface TestCasesProps {
    projectId: string
    version: string
    tool: string
    status: string
    testcases: TestCaseInterface[]
}

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

export default function TestCases({
    projectId,
    version,
    tool,
    status,
    testcases
}: TestCasesProps) {

    const [deleteLoading, setDeleteLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [downloadsInProgress, setDownloadsInProgress] = useState([])

    const { downloadSingleDataset } = useDownloadDatasets(projectId, version)

    const testcasesPerPage = 50
    const totalPages = Math.ceil(testcases.length / testcasesPerPage)

    const indexOfLastTestcase = currentPage * testcasesPerPage
    const indexOfFirstTestcase = indexOfLastTestcase - testcasesPerPage
    const currentTestcases = testcases.slice(indexOfFirstTestcase, indexOfLastTestcase)

    const canDelete = status === 'COMPLETE_TESTCASE_CREATION'

    async function deleteTestcase(tcId: string) {
        try {
            setDeleteLoading(true)
            const user = await getCurrentUser()
            if (!user) return
            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(
                `${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/${projectId}/v/${version}/t/${tcId}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            if (!response.ok) console.error('Could not delete testcase')
        } catch (err) {
            console.error(err)
        } finally {
            setDeleteLoading(false)
        }
    }

    async function downloadDataset(testcaseId: string) {
        try {
            if (downloadsInProgress.includes(testcaseId)) {
                return
            }

            setDownloadsInProgress(prev => [...prev, testcaseId])

            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            await downloadSingleDataset(testcaseId)

            setDownloadsInProgress(prev => prev.filter(id => id !== testcaseId))

        } catch (err) {
            console.error(err)
        }
    }


    return (
        <div className='w-full flex flex-col gap-8 items-center'>
            {currentTestcases.length > 0 ? (
                <div className='w-full flex flex-col gap-4'>
                    {currentTestcases.map((t) => (
                        <div key={t.testcase_id} className='relative p-4 shadow-md shadow-black/30 dark:shadow-black/50 rounded-lg'>
                            <div className='flex items-center gap-1 text-color-primary/50 text-xs'>
                                <span>
                                    {t.testcase_id}
                                </span>
                            </div>
                            <div className='w-full flex items-center justify-between'>
                                <div className='flex items-center gap-1 text-color-primary/50 text-xs'>
                                    <span>
                                        Created for requirement {t.requirement_id}.
                                    </span>
                                    <a
                                        href={`#${t.requirement_id}`}
                                        target='_blank'
                                        className='flex items-center gap-1 border-b-2 border-dotted'
                                    >
                                        <span>Open Requirement</span>
                                        <MoveUpRight size={14} />
                                    </a>
                                </div>
                                <div className='flex items-center gap-2'>
                                    {t.datasets && t.datasets.length > 0 &&
                                        <button
                                            className='flex items-center gap-2 px-2 py-1 rounded-md shadow-sm hover:shadow-md shadow-black/30 dark:shadow-black/50 transition-shadow cursor-pointer'
                                            onClick={() => { downloadDataset(t.testcase_id) }}
                                        >
                                            <ArrowDownToLine />
                                            <span>Download Dataset</span>
                                            {downloadsInProgress.includes(t.testcase_id) &&
                                                <Loader2 className='animate-spin' size={20} />}
                                        </button>}
                                    {t.toolIssueLink &&
                                        <a
                                            href={t.toolIssueLink}
                                            target='_blank'
                                            className='flex items-center gap-2 px-2 py-1 rounded-md shadow-sm hover:shadow-md shadow-black/30 dark:shadow-black/50 transition-shadow'
                                        >
                                            <img
                                                src={JIRA_ICON.src}
                                                alt='Jira Logo'
                                                className='h-6'
                                            />
                                            <span>Open in {tool}</span>
                                        </a>}
                                    {canDelete && (
                                        <button
                                            className='text-red-500 absolute top-2 right-2 cursor-pointer'
                                            onClick={() => deleteTestcase(t.testcase_id)}
                                            disabled={deleteLoading}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className='flex items-center gap-1 text-color-primary/50 text-xs'>
                                <span>
                                    {TC_DATASET_STATUS_MESSAGES[t.dataset_status] || t.dataset_status}
                                </span>
                            </div>
                            {t.toolCreated === 'FAILED' &&
                                <div className='flex items-center gap-1 text-xs text-red-500 my-1'>
                                    <TriangleAlert size={14} />
                                    Sorry, I was not able to create this issue on {tool}. Can you go ahead and create it please?
                                </div>}
                            <h2 className='text-lg font-semibold my-2'>
                                <Markdown text={t.title} />
                            </h2>
                            <div className='text-sm'>
                                <b>Description</b>
                            </div>
                            <div className='my-1'>
                                <Markdown text={t.description} />
                            </div>
                            <div className='text-sm'>
                                <b>Acceptance Criteria</b>
                            </div>
                            <div className='my-1'>
                                <Markdown text={t.acceptance_criteria} />
                            </div>
                            <div className='text-sm'>
                                <b>Priority</b>
                            </div>
                            <div className='my-1'>
                                <Markdown text={t.priority} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No test cases found.</p>
            )}
            {testcases.length > testcasesPerPage && (
                <div className='sticky bottom-1 w-fit bg-secondary rounded-md shadow-md flex justify-center items-center gap-4 mt-8'>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className='bg-primary px-4 py-2 rounded-md shadow-md cursor-pointer disabled:opacity-50'
                    >
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className='bg-primary px-4 py-2 rounded-md shadow-md cursor-pointer disabled:opacity-50'
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}
