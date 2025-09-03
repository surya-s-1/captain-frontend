'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore'

import DetailsBanner from '@/components/projects/versions/details/banner'

import { Markdown } from '@/lib/utility/Markdown'
import { firestoreDb } from '@/lib/firebase'

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
            collection(firestoreDb, 'projects', projectId, 'versions', version, 'testcases')
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


    return (
        <div className='w-full h-full overflow-y-auto scrollbar'>
            <DetailsBanner />
            <div className='p-8 mb-16'>
                <div className='w-full sticky top-[160px] flex items-center justify-center gap-8 mb-8'>
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
                </div>
                {
                    tab === 'requirements' &&
                    <>
                        {requirements.length > 0 ? (
                            <div className='w-full flex flex-col gap-4'>
                                {requirements.map(r => (
                                    <div
                                        className='p-2 shadow-xl border'
                                        key={r.requirement_id}
                                        onClick={() => { }}
                                    >
                                        <h2 className='font-semibold text-color-primary/50'>{r.requirement_id}</h2>
                                        <Markdown text={r.requirement} />
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
                                    <div
                                        className='p-2 shadow-xl border'
                                        key={t.testcase_id}
                                        onClick={() => { }}
                                    >
                                        <h2 className='font-semibold text-color-primary/50'>{t.testcase_id}</h2>
                                        <h2 className='text-color-primary/50'>{t.requirement_id}</h2>
                                        <Markdown text={t.title} />
                                        <Markdown text={t.description} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No test cases found.</p>
                        )}
                    </>
                }
            </div>
        </div>
    )
}