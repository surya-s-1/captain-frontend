'use client'

import { useState } from 'react'
import { MoveUpRight, TriangleAlert, ArrowDownToLine, RefreshCcw, RefreshCcwDot, Loader2, WandSparkles, CircleQuestionMark } from 'lucide-react'

import { useFilter } from '@/hooks/useFilter'
import { usePagination } from '@/hooks/usePagination'
import { useDownloadDatasets } from '@/hooks/useDownloadDatasets'

import Dropdown from '@/lib/utility/ui/Dropdown'
import { Markdown } from '@/lib/utility/ui/Markdown'
import { CHANGE_ANALYSIS_DROPDOWN_OPTIONS, TC_DATASET_STATUS_MESSAGES } from '@/lib/utility/constants'
import { getCurrentUser } from '@/lib/firebase/utilities'

import JIRA_ICON from '@/../public/Jira_icon.png'

export interface TestCaseInterface {
    testcase_id: string
    title: string
    description: string
    acceptance_criteria: string
    priority: string
    requirement_id: string
    deleted: boolean
    change_analysis_status: string | null
    change_analysis_status_reason: string | null
    toolCreated: string | null
    toolIssueKey: string | null
    toolIssueLink: string | null
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
    const testcasesPerPage = 20

    const { filteredItems: filteredTestcases, FilterComponent } = useFilter({
        items: testcases,
        config: {
            testcase_id: { type: 'singleSearch', label: 'Testcase ID' },
            change_analysis_status: { type: 'multi', label: 'Delta Analysis' },
            dataset_status: { type: 'multi', label: 'Dataset Creation' },
            toolCreated: { type: 'multi', label: 'Created on ALM' }
        }
    })

    const { currentItems: currentTestcases, Pagination } = usePagination(filteredTestcases, testcasesPerPage)

    return (
        <div className='w-full flex flex-col gap-8 items-center'>
            {currentTestcases.length > 0 ? (
                <div className='w-full flex flex-col gap-4'>
                    {currentTestcases.map((t) => (
                        <Testcase
                            key={t.testcase_id}
                            testcase={t}
                            status={status}
                            projectId={projectId}
                            version={version}
                            tool={tool}
                        />
                    ))}
                </div>
            ) : (
                <p>No test cases found.</p>
            )}

            <div className={`w-full flex items-end justify-between z-10 sticky ${status.startsWith('CONFIRM_') ? 'bottom-24' : 'bottom-0'}`}>
                <Pagination />
                <FilterComponent className='items-end' />
            </div>
        </div>
    )
}

interface TestCaseProps {
    projectId: string
    version: string
    tool: string
    status: string
    testcase: TestCaseInterface
}

function Testcase({ testcase, status, projectId, version, tool }: TestCaseProps) {
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [downloadInProgress, setDownloadInProgress] = useState(false)
    const [enhancementInProgress, setEnhancementInProgress] = useState(false)
    const [resyncInProgress, setResyncInProgress] = useState(false)
    const [recreateInProgress, setRecreateInProgress] = useState(false)
    const [enhancementInput, setEnhancementInput] = useState('')

    const { downloadSingleDataset } = useDownloadDatasets(projectId, version)
    const canDelete = status === 'CONFIRM_TESTCASES'
    const canEnhance = status === 'CONFIRM_TESTCASES'

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
            if (downloadInProgress) {
                return
            }

            setDownloadInProgress(true)

            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            await downloadSingleDataset(testcaseId)
        } catch (err) {
            console.error(err)
        }

        setDownloadInProgress(false)
    }

    async function enhanceTestcase(testcaseId: string) {
        try {
            if (enhancementInProgress || !canEnhance) return

            setEnhancementInProgress(true)

            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/${projectId}/v/${version}/t/${testcaseId}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    prompt: enhancementInput
                })
            })

            if (!response.ok) alert(`Could not update testcase ${testcaseId}`)
        } catch (err) {
            alert(`Could not update testcase ${testcaseId}`)
            console.error(err)
        }

        setEnhancementInProgress(false)
        setEnhancementInput('')
    }

    async function resyncTestcases() {
        try {
            if (resyncInProgress) return

            setResyncInProgress(true)

            const user = await getCurrentUser()
            if (!user) throw new Error('No user found')

            const token = await user.getIdToken()
            if (!token) throw new Error('No token found')

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/${projectId}/v/${version}/testcases/sync`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!response.ok) alert(`Could not resync testcases`)
        } catch (err) {
            console.error(err)
            alert('Could not resync testcases')
        } finally {
            setResyncInProgress(false)
        }
    }

    async function recreateTestcase(testcase_id: string) {
        try {
            if (recreateInProgress) return

            setRecreateInProgress(true)

            const user = await getCurrentUser()
            if (!user) throw new Error('No user found')

            const token = await user.getIdToken()
            if (!token) throw new Error('No token found')

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/${projectId}/v/${version}/t/${testcase_id}/create/one`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!response.ok) alert(`Could not recreate testcases`)
        } catch (err) {
            console.error(err)
            alert('Could not recreate testcases')
        } finally {
            setRecreateInProgress(false)
        }
    }

    return (
        <div key={testcase.testcase_id} className='relative p-4 shadow-md shadow-black/30 dark:shadow-black/50 rounded-lg'>
            <div className='w-full flex flex-col lg:flex-row gap-4 justify-between'>
                <div className='flex flex-col gap-2 lg:flex-row lg:items-center text-color-primary/50 text-xs'>
                    <span>
                        {testcase.testcase_id}: This testcase is created for requirement {testcase.requirement_id}.
                    </span>
                    <a
                        href={`#${testcase.requirement_id}`}
                        target='_blank'
                        className='w-fit flex items-center gap-1 border-b-2 border-dotted'
                    >
                        <span>Open Requirement</span>
                        <MoveUpRight size={14} />
                    </a>
                    {testcase.change_analysis_status &&
                        <Dropdown
                            options={CHANGE_ANALYSIS_DROPDOWN_OPTIONS}
                            value={testcase.change_analysis_status}
                            onChange={() => {}}
                            isLoading={false}
                            disabled={true}
                            size='xs'
                        />}
                    {testcase.change_analysis_status_reason &&
                        <div className='py-1 cursor-pointer' title={testcase.change_analysis_status_reason}>
                            <CircleQuestionMark className='w-4 h-4 text-gray-400' />
                        </div>}
                </div>
                <div className='flex items-center gap-2'>

                    {testcase.toolCreated === 'FAILED' && status === 'COMPLETE_SYNC_TC_WITH_TOOL' &&
                        <>
                            <button
                                className='flex items-center gap-2 px-2 py-1 rounded-md shadow-sm hover:shadow-md shadow-black/30 dark:shadow-black/50 transition-shadow cursor-pointer'
                                onClick={() => { resyncTestcases() }}
                            >
                                <RefreshCcw />
                                <span>Retry Sync</span>
                                {resyncInProgress &&
                                    <Loader2 className='animate-spin' size={20} />}
                            </button>
                            <button
                                className='flex items-center gap-2 px-2 py-1 rounded-md shadow-sm hover:shadow-md shadow-black/30 dark:shadow-black/50 transition-shadow cursor-pointer'
                                onClick={() => { recreateTestcase(testcase.testcase_id) }}
                            >
                                <RefreshCcwDot />
                                <span>Retry Create</span>
                                {recreateInProgress &&
                                    <Loader2 className='animate-spin' size={20} />}
                            </button>
                        </>}


                    {testcase.datasets && testcase.datasets.length > 0 &&
                        <button
                            className='flex items-center gap-2 px-2 py-1 rounded-md shadow-sm hover:shadow-md shadow-black/30 dark:shadow-black/50 transition-shadow cursor-pointer'
                            onClick={() => { downloadDataset(testcase.testcase_id) }}
                        >
                            <ArrowDownToLine />
                            <span>Download Dataset</span>
                            {downloadInProgress &&
                                <Loader2 className='animate-spin' size={20} />}
                        </button>}

                    {testcase.toolIssueLink &&
                        <a
                            href={testcase.toolIssueLink}
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

                    {canDelete && testcase.change_analysis_status !== 'DEPRECATED' && (
                        <button
                            className='text-red-500 cursor-pointer'
                            onClick={() => deleteTestcase(testcase.testcase_id)}
                            disabled={deleteLoading}
                        >
                            Remove
                        </button>
                    )}
                </div>
            </div>
            <div className='mt-2 lg:mt-0 flex items-center gap-1 text-color-primary/50 text-xs'>
                <span>
                    {TC_DATASET_STATUS_MESSAGES[testcase.dataset_status] || testcase.dataset_status}
                </span>
            </div>
            {testcase.toolCreated === 'FAILED' &&
                <div className='flex items-center gap-1 text-xs text-red-500 my-1'>
                    <TriangleAlert size={14} />
                    Sorry, I was not able to create this issue on {tool}. Can you go ahead and create it please?
                </div>}
            <h2 className='text-lg font-semibold my-2'>
                <Markdown text={testcase.title} />
            </h2>
            <div className='text-sm'>
                <b>Description</b>
            </div>
            <div className='my-1'>
                <Markdown text={testcase.description} />
            </div>
            <div className='text-sm'>
                <b>Acceptance Criteria</b>
            </div>
            <div className='my-1'>
                <Markdown text={testcase.acceptance_criteria} />
            </div>
            <div className='text-sm'>
                <b>Priority</b>
            </div>
            <div className='my-1'>
                <Markdown text={testcase.priority} />
            </div>
            {canEnhance && testcase.change_analysis_status !== 'DEPRECATED' &&
                <div className='flex flex-col lg:flex-row lg:items-center gap-2'>
                    <input
                        type='text'
                        className='p-2 border border-gray-300 focus:outline-none rounded w-[90%]'
                        value={enhancementInput}
                        placeholder='Enhance the testcase...'
                        onChange={e => { !enhancementInProgress && setEnhancementInput(e.target.value) }}
                    />
                    <button
                        className='w-fit flex items-center gap-2 rounded-md shadow-sm hover:shadow-md shadow-black/30 dark:shadow-black/50 transition-shadow p-2 cursor-pointer'
                        onClick={() => enhanceTestcase(testcase.testcase_id)}
                        disabled={enhancementInProgress}
                    >
                        <WandSparkles size={24} />
                        Enhance
                        {enhancementInProgress && <Loader2 className='animate-spin' size={20} />}
                    </button>
                </div>}
        </div>
    )
}