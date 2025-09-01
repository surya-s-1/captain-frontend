'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { collection, onSnapshot, query, where } from 'firebase/firestore'

import { firestoreDb } from '@/lib/firebase'

export default function ProjectDetails() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const projectId = searchParams.get('projectId')
    const version = searchParams.get('version')

    const [requirements, setRequirements] = useState<any>([])
    const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null)
    const [testCases, setTestCases] = useState<any[]>([])

    useEffect(() => {
        if (!projectId || !version) {
            router.push('/projects')
            return
        }

        const q = query(
            collection(firestoreDb, 'projects', projectId, 'versions', version, 'requirements'),
            where('deleted', '==', false)
        )
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reqsList = snapshot.docs.map(d => ({ ...d.data() }))
            console.log(reqsList)
            setRequirements(reqsList)
        })

        return () => unsubscribe()
    }, [projectId, version, searchParams])

    useEffect(() => {
        if (!projectId || !version || !selectedRequirement) {
            return
        }

        const q = query(collection(firestoreDb, 'projects', projectId, 'versions', version, 'requirements', selectedRequirement, 'testcases'))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const testCasesList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            setTestCases(testCasesList)
        })

        return () => unsubscribe()
    }, [projectId, version, selectedRequirement])

    const handleRequirementClick = (reqId: string) => {
        setSelectedRequirement(reqId)
    }

    return (
        <div>
            <h2>Requirements</h2>
            {requirements.length > 0 ? (
                <ul>
                    {requirements.map(r => (
                        <li 
                            key={r.requirement_id} 
                            onClick={() => handleRequirementClick(r.id)} style={{ cursor: 'pointer' }}>
                            {r.name}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No requirements found.</p>
            )}

            {selectedRequirement && (
                <>
                    <h3>Test Cases for Requirement: {selectedRequirement}</h3>
                    {testCases.length > 0 ? (
                        <ul>
                            {testCases.map(tc => (
                                <li key={tc.id}>{tc.description}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No test cases found.</p>
                    )}
                </>
            )}
        </div>
    )    
}