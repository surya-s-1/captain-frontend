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

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

type Tab = 'requirements' | 'testcases' | 'datasets'

export default function ProjectDetails() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const projectId = searchParams.get('projectId')
    const version = searchParams.get('version')

    const [status, setStatus] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [projectName, setProjectName] = useState<string>('')
    const [latestVersion, setLatestVersion] = useState<string>('')
    const [versionFiles, setVersionFiles] = useState<string[]>([])
    const [toolName, setToolName] = useState<string>('')
    const [requirements, setRequirements] = useState<RequirementInterface[]>([])
    const [showRequirements, setShowRequirements] = useState<RequirementInterface[]>([])
    const [testcases, setTestcases] = useState<TestCaseInterface[]>([])
    const [tab, setTab] = useState<Tab>('requirements')
    const [submitLoading, setSubmitLoading] = useState(false)

    const HIDE_TABS = (version === 'v1' && status === 'CREATED') || status.startsWith('ERR')

    async function fetchProject() {
        if (!projectId) {
            router.push('/projects')
            return
        }

        const projectRef = doc(firestoreDb, 'projects', projectId)

        const unsubscribe = onSnapshot(projectRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data()
                setProjectName(data.toolProjectName || '')
                setLatestVersion(data.latest_version || '')
                setToolName(data.tool || '')
            } else {
                setError('Project not found!')
                setTimeout(() => {
                    router.push('/projects')
                }, 2000)
                return
            }
        })

        return () => unsubscribe()
    }

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
            setLatestVersion(projectData.latest_version || '')

            if (!projectData.uids || !projectData.uids.includes(user.uid)) {
                setError('You do not have access to this project.')
                setTimeout(() => router.push('/projects'), 2000)
                return
            }

            const versionDocRef = doc(firestoreDb, 'projects', projectId, 'versions', version)

            const unsubscribe = onSnapshot(versionDocRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data()
                    setStatus(data.status || 'NA')
                    setVersionFiles(data?.files?.map((f: any) => f?.name) || [])
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
            // where('change_analysis_status', '!=', CHANGE_ANALYSIS_STATUS.IGNORED),
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
        if (!projectId || !version) {
            router.push('/projects')
            return
        }

        fetchProject()
        fetchVersion()
        fetchRequirements()
        fetchTestcases()
    }, [projectId, version])

    useEffect(() => {
        if (status === 'CONFIRM_CHANGE_ANALYSIS_EXPLICIT') {
            setShowRequirements(requirements.filter(r => r.source_type !== 'implicit'))
        } else {
            setShowRequirements(requirements)
        }
    }, [requirements, status])


    async function confirmRequirements() {
        try {
            if (version !== latestVersion) {
                alert('Not allowed in this version')
                return
            }

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
            if (version !== latestVersion) {
                alert('Not allowed in this version')
                return
            }

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
            if (version !== latestVersion) {
                alert('Not allowed in this version')
                return
            }

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
            <DetailsBanner
                projectName={projectName}
                latestVersion={version === latestVersion}
                versionFiles={versionFiles}
                status={status}
            />

            {!HIDE_TABS && (
                <div className='w-ful sticky top-[150px] backdrop-blur-xs bg-white/20 flex items-center justify-center gap-8 py-2 shadow-xl z-20 text-sm font-medium'>
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

            <div className='p-8 mb-8'>
                {tab === 'requirements' && (
                    <Requirements
                        projectId={projectId!}
                        version={version!}
                        latestVersion={version === latestVersion}
                        toolName={toolName}
                        status={status}
                        requirements={showRequirements}
                    />
                )}

                {tab === 'testcases' && (
                    <TestCases
                        projectId={projectId!}
                        version={version!}
                        latestVersion={version === latestVersion}
                        toolName={toolName}
                        status={status}
                        testcases={testcases}
                    />
                )}

                {tab === 'datasets' && (
                    <Datasets
                        projectId={projectId}
                        version={version}
                        latestVersion={version === latestVersion}
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