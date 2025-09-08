'use client'

import { useState } from 'react'
import { MoveUpRight, SquareCheckBig, TriangleAlert } from 'lucide-react'

import { getCurrentUser } from '@/lib/firebase/utilities'
import { Markdown } from '@/lib/utility/ui/Markdown'

import JIRA_ICON from '@/../public/Jira_icon.png'

export interface TestCaseInterface {
    title: string
    description: string
    acceptance_criteria: string
    priority: string
    testcase_id: string
    requirement_id: string
    toolIssueLink: string
    deleted: boolean
    created: string | null
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

    const canDelete = status === 'COMPLETE_TESTCASE_CREATION'


    async function deleteTestcase(tcId: string) {
        try {
            setDeleteLoading(true)
            const user = await getCurrentUser()
            if (!user) return
            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(
                `${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/${projectId}/v/${version}/t/${tcId}/delete`,
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


    return (
        <>
            {testcases.length > 0 ? (
                <div className='w-full flex flex-col gap-4'>
                    {testcases.map((t) => (
                        <div key={t.testcase_id} className='relative p-4 shadow-md shadow-black/30 dark:shadow-black/50 rounded-lg'>
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
                                    {t.toolIssueLink &&
                                        <a
                                            href={t.toolIssueLink}
                                            target='_blank'
                                            className='flex items-center gap-2 p-1 rounded-md shadow-sm hover:shadow-md shadow-black/30 dark:shadow-black/50 transition-shadow'
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
                            {t.created === 'SUCCESS' &&
                                <div className='flex items-center gap-1 text-xs my-1'>
                                    <SquareCheckBig size={14} />
                                    Created this testcase on {tool}.
                                </div>}
                            {t.created === 'FAILED' &&
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
        </>
    )
}
