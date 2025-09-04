'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore'

import DetailsBanner from '@/components/projects/versions/details/banner'

import { Markdown } from '@/lib/utility/ui/Markdown'
import { Notice } from '@/lib/utility/ui/Notice'

import { firestoreDb } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/firebase/utilities'
import { stat } from 'fs'

interface Requirement {
    requirement_id: string,
    requirement: string,
    requirement_type: string,
    sources: string[],
    regulations: string[],
    verified: boolean,
    deleted: boolean
}

interface TestCase {
    title: string
    description: string
    acceptance_criteria: string
    priority: string
    testcase_id: string
    requirement_id: string
}

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

export default function ProjectDetails() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const projectId = searchParams.get('projectId')
    const version = searchParams.get('version')

    const [status, setStatus] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [requirements, setRequirements] = useState<Requirement[]>([])
    const [testcases, setTestcases] = useState<TestCase[]>([])
    const [tab, setTab] = useState<'requirements' | 'testcases'>('requirements')
    const [submitLoading, setSubmitLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const HIDE_TABS = status === 'CREATED' || status.startsWith('ERR')
    const SHOW_DEL_REQ_BTN = status === 'CONFIRM_REQ_EXTRACT_P2'
    const SHOW_DEL_TC_BTN = status === 'CONFIRM_TESTCASE_CREATION'

    async function fetchVersion() {
        if (!projectId || !version) {
            router.push('/projects')
            return
        }

        const versionDocRef = doc(firestoreDb, 'projects', projectId, 'versions', version)

        const unsubscribe = onSnapshot(versionDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setStatus(data.status || 'Unknown')
            } else {
                setError('Version not found!')
                setTimeout(() => {
                    router.push('/projects')
                }, 2000)
                return
            }
        })

        return () => unsubscribe()
    }

    async function fetchRequirements() {
        const reqQuery = query(
            collection(firestoreDb, 'projects', projectId, 'versions', version, 'requirements'),
            where('deleted', '==', false)
        )

        const reqUnsubscribe = onSnapshot(reqQuery, (snapshot) => {
            const reqsList = snapshot.docs.map(d => ({ ...d.data() })) as Requirement[]
            setRequirements(reqsList)
        })

        return () => reqUnsubscribe()
    }

    async function fetchTestcases() {
        const reqQuery = query(
            collection(firestoreDb, 'projects', projectId, 'versions', version, 'testcases'),
            where('deleted', '==', false)
        )

        const testsUnsubscribe = onSnapshot(reqQuery, (snapshot) => {
            const testsList = snapshot.docs.map(d => ({ ...d.data() })) as TestCase[]
            setTestcases(testsList)
        })

        return () => testsUnsubscribe()
    }

    useEffect(() => {
        fetchVersion()
        fetchRequirements()
        fetchTestcases()
    }, [projectId, version])

    async function confirmRequirements() {
        try {
            setSubmitLoading(true)

            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/${projectId}/v/${version}/requirements/confirm`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                console.error('Could not confirm requirements')
            } else {
                setTab('testcases')
            }

            setSubmitLoading(false)
        } catch (error) {
            console.error(error)
        }
    }

    async function confirmTestcases() {
        try {
            setSubmitLoading(true)

            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            setTimeout(async () => {
                const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/${projectId}/v/${version}/testcases/confirm`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    console.error('Could not confirm testcases')
                }

                setSubmitLoading(false)
            }, 2000)
        } catch (error) {
            console.error(error)
        }
    }

    async function deleteRequirement(reqId: string) {
        try {
            setDeleteLoading(true)

            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/${projectId}/v/${version}/r/${reqId}/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                console.error('Could not delete requirement')
            }

            setDeleteLoading(false)
        } catch (error) {
            console.error(error)
        }
    }

    async function deleteTestcase(tcId: string) {
        try {
            setDeleteLoading(true)

            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/${projectId}/v/${version}/t/${tcId}/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                console.error('Could not delete testcase')
            }

            setDeleteLoading(false)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className='w-full h-full overflow-y-auto scrollbar'>
            <DetailsBanner />
            {!HIDE_TABS &&
                <div className='w-ful sticky top-[150px] backdrop-blur-xs bg-white/30 flex items-center justify-center gap-8 py-2 shadow-xl z-10'>
                    <button
                        className={`p-2 rounded ${tab === 'requirements' ? 'bg-primary-contrast text-color-primary-contrast' : 'cursor-pointer'}`}
                        onClick={() => setTab('requirements')}
                    >
                        Requirements
                    </button>
                    <button
                        className={`p-2 rounded ${tab === 'testcases' ? 'bg-primary-contrast text-color-primary-contrast' : 'cursor-pointer'}`}
                        onClick={() => setTab('testcases')}
                    >
                        Test Cases
                    </button>
                </div>}
            <div className='p-8 mb-16'>
                {
                    tab === 'requirements' &&
                    <>
                        {requirements.length > 0 ? (
                            <div className='w-full flex flex-col gap-4'>
                                {requirements.map(r => (
                                    <div key={r.requirement_id} className='relative p-2 shadow-xl border'>
                                        {SHOW_DEL_REQ_BTN  &&
                                        <button
                                            className='text-red-500 absolute top-2 right-2 cursor-pointer'
                                            onClick={() => deleteRequirement(r.requirement_id)}
                                            disabled={deleteLoading}
                                        >
                                            Remove
                                        </button>}
                                        <h2 className='font-semibold text-color-primary/50'>{r.requirement_id}</h2>
                                        <Markdown text={r.requirement} />
                                        <div className='flex flex-col gap-2 mt-4'>
                                            {r.sources && r.sources.length > 0 && (
                                                <div>
                                                    <h3 className='font-semibold'>Sources</h3>
                                                    <ul className='flex flex-col gap-2'>
                                                        {r.sources.map((source, index) => (
                                                            <li
                                                                key={index}
                                                                className='list-disc ml-5'
                                                            >
                                                                {source.split('_')?.[1] || source.split('_')?.[0]}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {r.regulations && r.regulations.length > 0 && (
                                                <div>
                                                    <h3 className='font-semibold'>Regulations</h3>
                                                    <ul className='flex flex-col gap-2'>
                                                        {r.regulations.map((regulation, index) => (
                                                            <li
                                                                key={index}
                                                                className='list-disc ml-5'
                                                            >
                                                                {regulation}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No requirements found.</p>
                        )}
                    </>
                }
                {
                    tab === 'testcases' &&
                    <>
                        {testcases.length > 0 ? (
                            <div className='w-full flex flex-col gap-4'>
                                {testcases.map(t => (
                                    <div key={t.testcase_id} className='relative p-2 shadow-xl border'>
                                        {SHOW_DEL_TC_BTN &&
                                        <button
                                            className='text-red-500 absolute top-2 right-2 cursor-pointer'
                                            onClick={() => deleteTestcase(t.testcase_id)}
                                            disabled={deleteLoading}
                                        >
                                            Remove
                                        </button>}
                                        <h2 className='font-semibold text-color-primary/50'>{t.testcase_id}</h2>
                                        <h2 className='text-color-primary/50 text-xs'>Created for requirement {t.requirement_id}</h2>
                                        <p><b>Title:</b></p>
                                        <Markdown text={t.title} />
                                        <p><b>Description:</b></p>
                                        <Markdown text={t.description} />
                                        <p><b>Acceptance Criteria:</b></p>
                                        <Markdown text={t.acceptance_criteria} />
                                        <p><b>Priority:</b></p>
                                        <Markdown text={t.priority} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No test cases found.</p>
                        )}
                    </>
                }
            </div>
            {status === 'CONFIRM_REQ_EXTRACT_P2' && (
                <Notice
                    title='Manual Verification Selected'
                    content='Please remove any unwanted requirement from the extracted requirements and confirm to go ahead with test cases creation.'
                    buttonLabel='Confirm'
                    loading={submitLoading}
                    callback={() => confirmRequirements()}
                />
            )}
            {status === 'CONFIRM_TESTCASE_CREATION' && (
                <Notice
                    title='Verify the test cases'
                    content='Please remove any unwanted test case from the proposed test cases and confirm to go ahead with their creation on Jira project.'
                    buttonLabel='Confirm'
                    loading={submitLoading}
                    callback={() => confirmTestcases()}
                />
            )}
        </div>
    )
}