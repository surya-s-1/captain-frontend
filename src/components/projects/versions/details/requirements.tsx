'use client'

import { useEffect } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { firestoreDb } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/firebase/utilities'
import { Markdown } from '@/lib/utility/ui/Markdown'

export interface RequirementInterface {
    requirement_id: string
    requirement: string
    requirement_type: string
    sources: string[]
    regulations: string[]
    deleted: boolean
}

interface RequirementsProps {
    projectId: string
    version: string
    requirements: RequirementInterface[]
    setRequirements: (reqs: RequirementInterface[]) => void
    deleteLoading: boolean
    setDeleteLoading: (val: boolean) => void
    canDelete: boolean
}

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

export default function Requirements({
    projectId,
    version,
    requirements,
    setRequirements,
    deleteLoading,
    setDeleteLoading,
    canDelete
}: RequirementsProps) {
    useEffect(() => {
        const reqQuery = query(
            collection(firestoreDb, 'projects', projectId, 'versions', version, 'requirements'),
            where('deleted', '==', false)
        )

        const unsubscribe = onSnapshot(reqQuery, (snapshot) => {
            const reqsList = snapshot.docs.map(d => ({ ...d.data() })) as RequirementInterface[]
            setRequirements(reqsList)
        })

        return () => unsubscribe()
    }, [projectId, version, setRequirements])

    async function deleteRequirement(reqId: string) {
        try {
            setDeleteLoading(true)
            const user = await getCurrentUser()
            if (!user) return
            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(
                `${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/${projectId}/v/${version}/r/${reqId}/delete`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            if (!response.ok) console.error('Could not delete requirement')
        } catch (err) {
            console.error(err)
        } finally {
            setDeleteLoading(false)
        }
    }

    return (
        <>
            {requirements.length > 0 ? (
                <div className="w-full flex flex-col gap-4">
                    {requirements.map((r) => (
                        <div key={r.requirement_id} className="relative p-2 shadow-xl border">
                            {canDelete && (
                                <button
                                    className="text-red-500 absolute top-2 right-2 cursor-pointer"
                                    onClick={() => deleteRequirement(r.requirement_id)}
                                    disabled={deleteLoading}
                                >
                                    Remove
                                </button>
                            )}
                            <h2 className="font-semibold text-color-primary/50">{r.requirement_id}</h2>
                            <Markdown text={r.requirement} />
                            <div className="flex flex-col gap-2 mt-4">
                                {r.sources?.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold">Sources</h3>
                                        <ul className="flex flex-col gap-2">
                                            {r.sources.map((source, index) => (
                                                <li key={index} className="list-disc ml-5">
                                                    {source.split('_')?.[1] || source.split('_')?.[0]}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {r.regulations?.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold">Regulations</h3>
                                        <ul className="flex flex-col gap-2">
                                            {r.regulations.map((regulation, index) => (
                                                <li key={index} className="list-disc ml-5">
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
    )
}