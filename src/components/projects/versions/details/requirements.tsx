'use client'

import { useState, useEffect } from 'react'

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
    status: string
    requirements: RequirementInterface[]
}

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

export default function Requirements({
    projectId,
    version,
    status,
    requirements
}: RequirementsProps) {

    const [deleteLoading, setDeleteLoading] = useState(false)

    const canDelete = status === 'CONFIRM_REQ_EXTRACT_P2'


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


    useEffect(() => {
        if (requirements.length > 0 && window.location.hash) {
            const el = document.querySelector(window.location.hash)
            el?.scrollIntoView({ behavior: "smooth" })
        }
    }, [requirements])


    return (
        <>
            {requirements.length > 0 ? (
                <div className='w-full flex flex-col gap-4'>
                    {requirements.map((r) => (
                        <div id={r.requirement_id} key={r.requirement_id} className='relative p-2 shadow-md shadow-black/30 dark:shadow-black/50 rounded-lg scroll-mt-[210px]'>
                            {canDelete && (
                                <button
                                    className='text-red-500 absolute top-2 right-2 cursor-pointer'
                                    onClick={() => deleteRequirement(r.requirement_id)}
                                    disabled={deleteLoading}
                                >
                                    Remove
                                </button>
                            )}
                            <h2 className='text-color-primary/50 text-sm mb-1'>{r.requirement_id}</h2>
                            <Markdown text={r.requirement} />
                            <div className='flex flex-col gap-2 mt-4'>
                                {r.sources?.length > 0 && (
                                    <div>
                                        <h3 className='font-semibold'>Sources</h3>
                                        <ul className='flex flex-col gap-2'>
                                            {r.sources.map((source, index) => (
                                                <li key={index} className='list-disc ml-5'>
                                                    {source.split('_')?.[1] || source.split('_')?.[0]}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {r.regulations?.length > 0 && (
                                    <div>
                                        <h3 className='font-semibold'>Regulations</h3>
                                        <ul className='flex flex-col gap-2'>
                                            {r.regulations.map((regulation, index) => (
                                                <li key={index} className='list-disc ml-5'>
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