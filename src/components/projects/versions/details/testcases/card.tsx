'use client'

import { useEffect, useState } from 'react'
import { MoveUpRight, TriangleAlert, ArrowDownToLine, RefreshCcw, RefreshCcwDot, Loader2, WandSparkles, CircleQuestionMark, Eye, EyeOff } from 'lucide-react'

import { useDownload } from '@/hooks/useDownload'

import Dropdown from '@/lib/utility/ui/Dropdown'
import { Markdown } from '@/lib/utility/ui/Markdown'
import { ExpandingButton, ExpandingLink } from '@/lib/utility/ui/ExpandingButton'
import { CHANGE_ANALYSIS_DROPDOWN_OPTIONS, TC_DATASET_STATUS_MESSAGES } from '@/lib/utility/constants'
import { getCurrentUser } from '@/lib/firebase/utilities'

import JIRA_ICON from '@/../public/Jira_icon.png'

import { TestCaseInterface } from '@/components/projects/versions/details/testcases'

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

interface TestCaseProps {
    projectId: string
    version: string
    latestVersion: boolean
    toolName: string
    status: string
    testcase: TestCaseInterface
    hideDetails: boolean
}

export function Testcase({ testcase, status, projectId, version, latestVersion, toolName, hideDetails }: TestCaseProps) {
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [enhancementInProgress, setEnhancementInProgress] = useState(false)
    const [resyncInProgress, setResyncInProgress] = useState(false)
    const [recreateInProgress, setRecreateInProgress] = useState(false)
    const [enhancementInput, setEnhancementInput] = useState('')
    const [isExpanded, setIsExpanded] = useState(!hideDetails)

    useEffect(() => {
        setIsExpanded(!hideDetails)
    }, [hideDetails])

    const { downloadSingleDataset, downloadSingleLoading } = useDownload(projectId, version)
    const canDelete = status === 'CONFIRM_TESTCASES' && latestVersion && !['DEPRECATED', 'UNCHANGED'].includes(testcase.change_analysis_status)
    const canEnhance = status === 'CONFIRM_TESTCASES' && latestVersion && !['DEPRECATED', 'UNCHANGED'].includes(testcase.change_analysis_status)

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
            if (downloadSingleLoading) {
                return
            }

            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            await downloadSingleDataset(testcaseId)
        } catch (err) {
            console.error(err)
        }
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
        <div key={testcase.testcase_id} className='relative p-4 border-[1] border-gray-300 shadow-sm rounded-lg'>
            <div className='w-full flex flex-col lg:flex-row gap-4 justify-between'>
                <div className='flex flex-col gap-2 lg:flex-row lg:items-center text-color-primary/50 text-xs'>
                    <span>
                        <strong>{testcase.testcase_id}:</strong> This testcase is created for requirement {testcase.requirement_id}.
                    </span>
                    <a
                        href={`#${testcase.requirement_id}`}
                        target='_blank'
                        className='w-fit flex items-center gap-1 border-b-2 border-dotted'
                    >
                        <span>View Requirement</span>
                        <MoveUpRight size={14} />
                    </a>
                    {testcase.change_analysis_status &&
                        <Dropdown
                            options={CHANGE_ANALYSIS_DROPDOWN_OPTIONS}
                            value={testcase.change_analysis_status}
                            onChange={() => { }}
                            isLoading={false}
                            disabled={true}
                            size='xs'
                        />}
                    {testcase.change_analysis_status_reason &&
                        <div className='py-1 cursor-pointer' title={testcase.change_analysis_status_reason}>
                            <CircleQuestionMark className='w-4 h-4 text-gray-400' />
                        </div>}

                    <ExpandingButton
                        Icon={isExpanded ? EyeOff : Eye}
                        openLabel={isExpanded ? 'Hide Details' : 'Show Details'}
                        onClick={() => { setIsExpanded(prev => !prev) }}
                        size='sm'
                        className='border-none shadow-transparent shadow-none hover:shadow-none'
                    />
                </div>
                <div className='flex items-center gap-2'>
                    {testcase.toolCreated === 'FAILED' && status === 'COMPLETE_SYNC_TC_WITH_TOOL' &&
                        <>
                            <ExpandingButton
                                Icon={RefreshCcw}
                                openLabel='Retry Sync'
                                onClick={() => { resyncTestcases() }}
                                isLoading={resyncInProgress}
                            />
                            <ExpandingButton
                                Icon={RefreshCcwDot}
                                openLabel='Retry Create'
                                onClick={() => { recreateTestcase(testcase.testcase_id) }}
                                isLoading={recreateInProgress}
                            />
                        </>}

                    {testcase.datasets && testcase.datasets.length > 0 &&
                        <ExpandingButton
                            Icon={ArrowDownToLine}
                            openLabel='Download Dataset'
                            onClick={() => { downloadDataset(testcase.testcase_id) }}
                            isLoading={downloadSingleLoading}
                            className='shadow-none hover:shadow-sm'
                        />}

                    {testcase.toolIssueLink &&
                        <ExpandingLink
                            imageUrl={JIRA_ICON.src}
                            label={`Open in ${toolName}`}
                            href={testcase.toolIssueLink}
                            className='shadow-none hover:shadow-sm'
                        />}

                    {canDelete && (
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
            {testcase.toolCreated === 'FAILED' && testcase.change_analysis_status !== 'DEPRECATED' &&
                <div className='flex items-center gap-1 text-xs text-red-500 my-1'>
                    <TriangleAlert size={14} />
                    Captain failed to create this issue on {toolName}.
                </div>}
            <h2 className='text-lg font-semibold my-2'>
                <Markdown text={testcase.title} />
            </h2>
            {isExpanded && (
                <>
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
                    {canEnhance &&
                        <div className='flex lg:flex-row lg:items-center gap-2 mt-4'>
                            <input
                                type='text'
                                className='flex-1 rounded-full p-2 border border-gray-400 focus:outline-none w-[90%]'
                                value={enhancementInput}
                                placeholder='Enhance the testcase...'
                                onChange={e => { !enhancementInProgress && setEnhancementInput(e.target.value) }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        enhanceTestcase(testcase.testcase_id)
                                    }
                                }}
                            />
                            <ExpandingButton
                                Icon={WandSparkles}
                                isLoading={enhancementInProgress}
                                openLabel='Enhance'
                                onClick={() => enhanceTestcase(testcase.testcase_id)}
                            />
                        </div>}
                </>
            )}
        </div>
    )
}