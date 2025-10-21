'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { doc, getDoc, onSnapshot, query, collection, where, orderBy } from 'firebase/firestore'

import DetailsBanner from '@/components/projects/versions/details/banner'
import Requirements, { RequirementInterface } from '@/components/projects/versions/details/requirements'
import TestCases, { TestCaseInterface } from '@/components/projects/versions/details/testcases'
import Datasets from '@/components/projects/versions/details/datasets'

import { Notice } from '@/lib/utility/ui/Notice'
import { firestoreDb } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/firebase/utilities'
import { CHANGE_ANALYSIS_STATUS, SUPPORTED_TOOLS } from '@/lib/utility/constants'

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

type Tab = 'requirements' | 'testcases' | 'datasets'

export default function ProjectDetails() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const projectId = searchParams.get('projectId')
    const version = searchParams.get('version')
    const tool = searchParams.get('tool')

    const [status, setStatus] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [requirements, setRequirements] = useState<RequirementInterface[]>([])
    const [testcases, setTestcases] = useState<TestCaseInterface[]>([])
    const [tab, setTab] = useState<Tab>('requirements')
    const [submitLoading, setSubmitLoading] = useState(false)

    const HIDE_TABS = status === 'CREATED' || status.startsWith('ERR')


    async function fetchVersion() {
        try {
            const user = await getCurrentUser()
            if (!user) return

            const projectRef = doc(firestoreDb, 'projects', projectId)
            const projectSnap = await getDoc(projectRef)

            if (!projectSnap.exists()) {
                setError('Project not found!')
                setTimeout(() => router.push('/projects'), 2000)
                return
            }

            const projectData = projectSnap.data()

            if (!projectData.uids || !projectData.uids.includes(user.uid)) {
                setError('You do not have access to this project.')
                setTimeout(() => router.push('/projects'), 2000)
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
        } catch (err) {
            console.error('Error fetching version:', err)
            setError('Something went wrong!')
            setTimeout(() => router.push('/projects'), 2000)
        }
    }


    async function fetchRequirements() {
        const reqQuery = query(
            collection(firestoreDb, 'projects', projectId, 'versions', version, 'requirements'),
            where('deleted', '==', false),
            where('duplicate', '==', false),
            where('change_analysis_status', '!=', CHANGE_ANALYSIS_STATUS.IGNORED),
            orderBy('requirement_id', 'asc')
        )

        const unsubscribe = onSnapshot(reqQuery, (snapshot) => {
            const reqsList = snapshot.docs.map(d => {
                const data = d.data()
                const { embedding, ...restOfData } = data
                return restOfData
            }) as RequirementInterface[]

            setRequirements(reqsList)
        })

        return () => unsubscribe()
    }


    async function fetchTestcases() {
        const testcaseQuery = query(
            collection(firestoreDb, 'projects', projectId, 'versions', version, 'testcases'),
            where('deleted', '==', false),
            orderBy('testcase_id', 'asc')
        )

        const unsubscribe = onSnapshot(testcaseQuery, (snapshot) => {
            const testsList = snapshot.docs.map(d => ({ ...d.data() })) as TestCaseInterface[]
            setTestcases(testsList)
        })

        return () => unsubscribe()
    }

    useEffect(() => {
        if (!projectId || !version || !tool || !Object.values(SUPPORTED_TOOLS).includes(tool)) {
            router.push('/projects')
            return
        }

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

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/${projectId}/v/${version}/requirements/confirm`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!response.ok) {
                console.error('Could not confirm requirements')
                alert('Could not confirm requirements')
            }
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

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/${projectId}/v/${version}/testcases/confirm`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!response.ok) {
                console.error('Could not confirm testcases')
                alert('Could not confirm testcases')
            }
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitLoading(false)
        }
    }


    async function confirmChangeAnalysis() {
        try {
            setSubmitLoading(true)
            const user = await getCurrentUser()
            if (!user) return

            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/${projectId}/v/${version}/changeAnalysis/confirm`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!response.ok) {
                console.error('Could not confirm change analysis')
                alert('Could not confirm change analysis')
            }
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitLoading(false)
        }
    }


    if (error) {
        return (
            <div className='text-error font-semibold'>{error}</div>
        )
    }

    function getTabClassName(input: Tab) {
        return `p-2 rounded ${tab === input ? 'bg-primary-contrast text-color-primary-contrast' : 'cursor-pointer'}`
    }

    return (
        <div className='w-full h-full overflow-y-auto scrollbar'>
            <DetailsBanner status={status} />

            {!HIDE_TABS && (
                <div className='w-ful sticky top-[150px] backdrop-blur-xs bg-white/20 flex items-center justify-center gap-8 py-2 shadow-xl z-10'>
                    <button
                        className={getTabClassName('requirements')}
                        onClick={() => setTab('requirements')}
                    >
                        Requirements ({requirements.length})
                    </button>
                    <button
                        className={getTabClassName('testcases')}
                        onClick={() => setTab('testcases')}
                    >
                        Test Cases ({testcases.length})
                    </button>
                    <button
                        className={getTabClassName('datasets')}
                        onClick={() => setTab('datasets')}
                    >
                        Datasets
                    </button>
                </div>
            )}

            <div className='p-8 mb-16'>
                {tab === 'requirements' && (
                    <Requirements
                        projectId={projectId!}
                        version={version!}
                        tool={tool}
                        status={status}
                        requirements={requirements}
                    />
                )}

                {tab === 'testcases' && (
                    <TestCases
                        projectId={projectId!}
                        version={version!}
                        tool={tool}
                        status={status}
                        testcases={testcases}
                    />
                )}

                {tab === 'datasets' && (
                    <Datasets
                        projectId={projectId}
                        version={version}
                        status={status}
                        testcase_ids={testcases.map(t => {
                            if (t.testcase_id) {
                                return t.testcase_id
                            }
                        })}
                    />
                )}
            </div>

            {status === 'CONFIRM_CHANGE_ANALYSIS_EXPLICIT' && (
                <Notice
                    title='Verify the results of change analysis'
                    content='Please update the change status of the explicit requirements if they are not captured correctly and click on confirm.'
                    buttonLabel='Confirm'
                    loading={submitLoading}
                    callback={confirmChangeAnalysis}
                />
            )}

            {status === 'CONFIRM_REQ_EXTRACT' && (
                <Notice
                    title='Verify proposed requirements'
                    content='Please remove any unwanted requirement from the extracted requirements and click confirm to go ahead with test cases creation.'
                    buttonLabel='Confirm'
                    loading={submitLoading}
                    callback={confirmRequirements}
                />
            )}

            {status === 'CONFIRM_REQ_EXTRACT_RETRY' && (
                <Notice
                    title='Retry'
                    content='Sorry, there was something wrong. Could you please retry?'
                    buttonLabel='Confirm'
                    loading={submitLoading}
                    callback={confirmRequirements}
                />
            )}

            {status === 'CONFIRM_TESTCASES' && (
                <Notice
                    title='Verify proposed test cases'
                    content={
                        version === 'v1' ?
                        'Please remove any unwanted test cases from the proposed ones and click confirm to go ahead with their creation on Jira project.' :
                        'Please remove any unwanted test cases and click confirm to go ahead with creation of new ones and updation of depreacted ones on Jira project.'
                    }
                    buttonLabel='Confirm'
                    loading={submitLoading}
                    callback={confirmTestcases}
                />
            )}
        </div>
    )
}