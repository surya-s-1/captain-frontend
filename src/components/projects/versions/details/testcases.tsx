'use client'

import { useEffect } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { firestoreDb } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/firebase/utilities'
import { Markdown } from '@/lib/utility/ui/Markdown'

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
    canDelete
}: TestCasesProps) {
    useEffect(() => {
        const reqQuery = query(
            collection(firestoreDb, 'projects', projectId, 'versions', version, 'testcases'),
            where('deleted', '==', false)
        )

        const unsubscribe = onSnapshot(reqQuery, (snapshot) => {
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
                <div className="w-full flex flex-col gap-4">
                    {testcases.map((t) => (
                        <div key={t.testcase_id} className="relative p-2 shadow-xl border">
                            {canDelete && (
                                <button
                                    className="text-red-500 absolute top-2 right-2 cursor-pointer"
                                    onClick={() => deleteTestcase(t.testcase_id)}
                                    disabled={deleteLoading}
                                >
                                    Remove
                                </button>
                            )}
                            <h2 className="font-semibold text-color-primary/50">{t.testcase_id}</h2>
                            <h2 className="text-color-primary/50 text-xs">
                                Created for requirement {t.requirement_id}
                            </h2>
                            <p><b>Title:</b></p>
                            <Markdown text={t.title} />
                            <p><b>Description:</b></p>
                            <Markdown text={t.description} />
                            <p><b>Acceptance Criteria:</b></p>
                            <Markdown text={t.acceptance_criteria} />
                            <p><b>Priority:</b></p>
                            <Markdown text={t.priority} />
                            {t.toolIssueLink && (
                                <>
                                    <p><b>Tool Issue Link:</b></p>
                                    <Markdown text={t.toolIssueLink} />
                                </>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No test cases found.</p>
            )}
        </>
    )
}
