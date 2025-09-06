'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { doc, onSnapshot } from 'firebase/firestore'

import DetailsBanner from '@/components/projects/versions/details/banner'
import Requirements, { RequirementInterface} from '@/components/projects/versions/details/requirements'
import TestCases, { TestCaseInterface } from '@/components/projects/versions/details/testcases'

import { Notice } from '@/lib/utility/ui/Notice'
import { firestoreDb } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/firebase/utilities'

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

type Tab = 'requirements' | 'testcases'

export default function ProjectDetails() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const projectId = searchParams.get('projectId')
    const version = searchParams.get('version')

    const [status, setStatus] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [requirements, setRequirements] = useState<RequirementInterface[]>([])
    const [testcases, setTestcases] = useState<TestCaseInterface[]>([])
    const [tab, setTab] = useState<Tab>('requirements')
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
                const data = docSnapshot.data()
                setStatus(data.status || 'Unknown')
            } else {
                setError('Version not found!')
                setTimeout(() => router.push('/projects'), 2000)
            }
        })

        return () => unsubscribe()
    }

    async function confirmRequirements() {
        try {
            setSubmitLoading(true)
            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/${projectId}/v/${version}/requirements/confirm`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!response.ok) console.error('Could not confirm requirements')
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitLoading(false)
        }
    }

    async function confirmTestcases() {
        try {
            setSubmitLoading(true)
            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/${projectId}/v/${version}/testcases/confirm`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!response.ok) console.error('Could not confirm testcases')
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitLoading(false)
        }
    }

    useEffect(() => {
        fetchVersion()
    }, [projectId, version])

    useEffect(() => {
        if (status === 'START_TESTCASE_CREATION') setTab('testcases')
    }, [status])

    return (
        <div className='w-full h-full overflow-y-auto scrollbar'>
            <DetailsBanner />

            {!HIDE_TABS && (
                <div className='w-ful sticky top-[150px] backdrop-blur-xs bg-white/30 flex items-center justify-center gap-8 py-2 shadow-xl z-10'>
                    <button
                        className={`p-2 rounded ${tab === 'requirements' ? 'bg-primary-contrast text-color-primary-contrast' : 'cursor-pointer'}`}
                        onClick={() => setTab('requirements')}
                    >
                        Requirements ({requirements.length})
                    </button>
                    <button
                        className={`p-2 rounded ${tab === 'testcases' ? 'bg-primary-contrast text-color-primary-contrast' : 'cursor-pointer'}`}
                        onClick={() => setTab('testcases')}
                    >
                        Test Cases ({testcases.length})
                    </button>
                </div>
            )}

            <div className='p-8 mb-16'>
                {tab === 'requirements' && (
                    <Requirements
                        projectId={projectId!}
                        version={version!}
                        requirements={requirements}
                        setRequirements={setRequirements}
                        deleteLoading={deleteLoading}
                        setDeleteLoading={setDeleteLoading}
                        canDelete={SHOW_DEL_REQ_BTN}
                    />
                )}

                {tab === 'testcases' && (
                    <TestCases
                        projectId={projectId!}
                        version={version!}
                        testcases={testcases}
                        setTestcases={setTestcases}
                        deleteLoading={deleteLoading}
                        setDeleteLoading={setDeleteLoading}
                        canDelete={SHOW_DEL_TC_BTN}
                    />
                )}
            </div>

            {status === 'CONFIRM_REQ_EXTRACT_P2' && (
                <Notice
                    title='Manual Verification Selected'
                    content='Please remove any unwanted requirement from the extracted requirements and click confirm to go ahead with test cases creation.'
                    buttonLabel='Confirm'
                    loading={submitLoading}
                    callback={confirmRequirements}
                />
            )}

            {status === 'CONFIRM_TESTCASE_CREATION' && (
                <Notice
                    title='Verify the test cases'
                    content='Please remove any unwanted test cases from the proposed ones and click confirm to go ahead with their creation on Jira project.'
                    buttonLabel='Confirm'
                    loading={submitLoading}
                    callback={confirmTestcases}
                />
            )}
        </div>
    )
}