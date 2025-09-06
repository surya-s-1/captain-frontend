'use client'

import { useEffect } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'

import { firestoreDb } from '@/lib/firebase'
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
}

interface TestCasesProps {
    projectId: string
    version: string
    tool: string
    testcases: TestCaseInterface[]
    setTestcases: (tests: TestCaseInterface[]) => void
    deleteLoading: boolean
    setDeleteLoading: (val: boolean) => void
    canDelete: boolean
}

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

export default function TestCases({
    projectId,
    version,
    testcases,
    setTestcases,
    deleteLoading,
    setDeleteLoading,
    canDelete,
    tool
}: TestCasesProps) {
    useEffect(() => {
        const testcaseQuery = query(
            collection(firestoreDb, 'projects', projectId, 'versions', version, 'testcases'),
            where('deleted', '==', false)
        )

        const unsubscribe = onSnapshot(testcaseQuery, (snapshot) => {
            const testsList = snapshot.docs.map(d => ({ ...d.data() })) as TestCaseInterface[]
            setTestcases(testsList)
        })

        return () => unsubscribe()
    }, [projectId, version, setTestcases])

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
                        <div key={t.testcase_id} className='relative p-4 shadow-md shadow-black/30 rounded-lg'>
                            <div className='w-full flex items-center justify-between'>
                                <div>
                                    <h2 className='font-semibold text-color-primary/50'>{t.testcase_id}</h2>
                                    <h2 className='text-color-primary/50 text-xs'>
                                        Created for requirement {t.requirement_id}
                                    </h2>
                                </div>
                                <div className='flex items-center gap-2'>
                                    {t.toolIssueLink &&
                                        <a
                                            href={t.toolIssueLink}
                                            target='_blank'
                                            className='flex items-center gap-2 p-1 border rounded shadow-sm hover:shadow-md shadow-black/30 transition-shadow'
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
