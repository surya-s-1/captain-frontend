'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { doc, getDoc, onSnapshot, query, collection, where, orderBy } from 'firebase/firestore'

import { useFilter } from '@/hooks/useFilter'

import DetailsBanner from '@/components/projects/versions/details/banner'
import Requirements, { RequirementInterface } from '@/components/projects/versions/details/requirements'
import TestCases, { TestCaseInterface } from '@/components/projects/versions/details/testcases'
import Datasets from '@/components/projects/versions/details/datasets'

import { Notice } from '@/lib/utility/ui/Notice'
import { firestoreDb } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/firebase/utilities'
import { getNoticeMessage } from '@/lib/utility/constants'

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

type Tab = 'requirements' | 'testcases' | 'datasets'

export default function ProjectDetails() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const projectId = searchParams.get('projectId')
    const version = searchParams.get('version')

    const [status, setStatus] = useState<string>('')
    const [projectName, setProjectName] = useState<string>('')
    const [latestVersion, setLatestVersion] = useState<string>('')
    const [versionFiles, setVersionFiles] = useState<string[]>([])
    const [toolName, setToolName] = useState<string>('')
    const [requirements, setRequirements] = useState<RequirementInterface[]>([])
    const [showRequirements, setShowRequirements] = useState<RequirementInterface[]>([])
    const [testcases, setTestcases] = useState<TestCaseInterface[]>([])
    const [tab, setTab] = useState<Tab>('requirements')
    const [submitLoading, setSubmitLoading] = useState(false)

    const HIDE_TABS = (version === 'v1' && status === 'CREATED')

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
                alert('Project not found!')
                router.push('/projects')
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
                alert('Project not found!')
                router.push('/projects')
                return
            }

            const projectData = projectSnap.data()
            setLatestVersion(projectData.latest_version || '')

            if (!projectData.uids || !projectData.uids.includes(user.uid)) {
                alert('You do not have access to this project.')
                router.push('/projects')
                return
            }

            const versionDocRef = doc(firestoreDb, 'projects', projectId, 'versions', version)

            const unsubscribe = onSnapshot(versionDocRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data()
                    setStatus(data.status || 'NA')
                    setVersionFiles(data?.files?.map((f: any) => f?.name) || [])
                } else {
                    alert('Version not found!')
                    router.push('/projects')
                    return
                }
            })

            return () => unsubscribe()
        } catch (err) {
            console.error('Error fetching version:', err)
            alert('Something went wrong!')
            router.push('/projects')
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
            if (snapshot.empty) {
                setRequirements([])
                return
            }

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


    async function confirmExplicitRequirements() {
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

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/${projectId}/v/${version}/requirements/explicit/confirm`, {
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

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/${projectId}/v/${version}/requirements/all/confirm`, {
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

    function getTabClassName(input: Tab) {
        return `p-2 rounded ${tab === input ? 'bg-primary-contrast text-color-primary-contrast' : 'cursor-pointer'}`
    }

    const { filteredItems: filteredRequirements, FilterPopup: RequirementsFilterPopup, FilterButton: RequirementsFilterButton } = useFilter({
        items: showRequirements,
        config: {
            source_type: {
                type: 'single',
                label: 'Requirements Source',
                options: [
                    {
                        label: 'Uploaded Documents',
                        value: 'explicit'
                    },
                    {
                        label: 'Regulations & Standards',
                        value: 'implicit'
                    }
                ]
            },
            requirement_category: {
                type: 'multi',
                label: 'Requirement Category'
            },
            testcase_status: {
                type: 'multi',
                label: 'Testcase Creation',
                options: [
                    {
                        label: 'Not started',
                        value: 'NOT_STARTED'
                    },
                    {
                        label: 'Queued',
                        value: 'TESTCASES_CREATION_QUEUED'
                    },
                    {
                        label: 'In Progress',
                        value: 'TESTCASES_CREATION_STARTED'
                    },
                    {
                        label: 'Completed',
                        value: 'TESTCASES_CREATION_COMPLETE'
                    },
                    {
                        label: 'Error',
                        value: 'ERR_TESTCASE_CREATION'
                    }
                ]
            },
            toolCreated: {
                type: 'multi',
                label: `${toolName.toUpperCase()} Issues`,
                options: [
                    {
                        label: 'Created',
                        value: 'SUCCESS'
                    },
                    {
                        label: 'Failed',
                        value: 'FAILED'
                    },
                    {
                        label: 'Not started',
                        value: 'NOT_STARTED'
                    }
                ]
            }
        }
    })

    const { filteredItems: filteredTestcases, FilterPopup: TestcasesFilterPopup, FilterButton: TestcasesFilterButton } = useFilter({
        items: testcases,
        config: {
            dataset_status: {
                type: 'multi',
                label: 'Dataset Creation',
                options: [
                    {
                        label: 'Completed',
                        value: 'DATASET_GENERATION_COMPLETED'
                    },
                    {
                        label: 'Queued',
                        value: 'DATASET_GENERATION_QUEUED'
                    },
                    {
                        label: 'In Progress',
                        value: 'DATASET_GENERATION_STARTED'
                    },
                    {
                        label: 'Not Started',
                        value: 'NOT_STARTED'
                    },
                    {
                        label: 'Failed',
                        value: 'ERR_DATASET_GENERATION'
                    }
                ]
            },
            toolCreated: {
                type: 'multi',
                label: `${toolName.toUpperCase()} Issues`,
                options: [
                    {
                        label: 'Created',
                        value: 'SUCCESS'
                    },
                    {
                        label: 'Failed',
                        value: 'FAILED'
                    },
                    {
                        label: 'Not started',
                        value: 'NOT_STARTED'
                    }
                ]
            }
        }
    })

    const [hideTestCaseDetails, setHideTestcaseDetails] = useState(false)

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
                        requirements={filteredRequirements}
                        RequirementsFilterButton={RequirementsFilterButton}
                        RequirementsFilterPopup={RequirementsFilterPopup}
                    />
                )}

                {tab === 'testcases' && (
                    <TestCases
                        projectId={projectId!}
                        version={version!}
                        latestVersion={version === latestVersion}
                        toolName={toolName}
                        status={status}
                        testcases={filteredTestcases}
                        TestcasesFilterPopup={TestcasesFilterPopup}
                        TestcasesFilterButton={TestcasesFilterButton}
                        hideDetails={hideTestCaseDetails}
                        setHideDetails={setHideTestcaseDetails}
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

            {['CONFIRM_EXP_REQ_EXTRACT', 'ERR_IMP_REQ_EXTRACT'].includes(status) &&
                <Notice
                    title={getNoticeMessage(status).title}
                    content={getNoticeMessage(status).content}
                    buttonLabel='Confirm'
                    loading={submitLoading}
                    callback={confirmExplicitRequirements}
                />}

            {['CONFIRM_CHANGE_ANALYSIS_EXPLICIT', 'ERR_CHANGE_ANALYSIS_IMPLICIT'].includes(status) && (
                <Notice
                    title={getNoticeMessage(status).title}
                    content={getNoticeMessage(status).content}
                    buttonLabel='Confirm'
                    loading={submitLoading}
                    callback={confirmChangeAnalysis}
                />
                )}

            {['CONFIRM_IMP_REQ_EXTRACT', 'ERR_TESTCASE_CREATION'].includes(status) &&
                <Notice
                    title={getNoticeMessage(status).title}
                    content={getNoticeMessage(status).content}
                    buttonLabel='Confirm'
                    loading={submitLoading}
                    callback={confirmRequirements}
                />}

            {['CONFIRM_TESTCASES', 'ERR_ALM_ISSUE_CREATION'].includes(status) && (
                <Notice
                    title={getNoticeMessage(status).title}
                    content={getNoticeMessage(status).content}
                    buttonLabel='Confirm'
                    loading={submitLoading}
                    callback={confirmTestcases}
                />
            )}
        </div>
    )
}