'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/firebase/utilities'
import { Markdown } from '@/lib/utility/ui/Markdown'

interface Source {
    filename: string
    location: string
    snippet: string
}

interface Regulation {
    regulation: string
    source: {
        filename: string
        page_start: string
        page_end: string
        snippet: string
        from_req_id: string
    }
}

export interface RequirementInterface {
    requirement_id: string
    requirement: string
    requirement_type: string
    sources: Source[]
    regulations: Regulation[]
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
    const [expandedSources, setExpandedSources] = useState<Record<string, Record<string, boolean>>>({})
    const [expandedRegs, setExpandedRegs] = useState<Record<string, Record<string, boolean>>>({})

    const canDelete = status === 'CONFIRM_REQ_EXTRACT'

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

    function groupSources(sources: Source[]) {
        const grouped: Record<string, string[]> = {}
        sources.forEach(src => {
            if (!grouped[src.filename]) grouped[src.filename] = []
            grouped[src.filename].push(src.location)
        })
        return grouped
    }

    function groupRegulations(regulations: Regulation[]) {
        const grouped: Record<string, string[]> = {}
        regulations.forEach(reg => {
            if (!grouped[reg.regulation]) grouped[reg.regulation] = []
            grouped[reg.regulation].push(reg.source.snippet)
        })
        return grouped
    }

    function toggleSource(requirementId: string, filename: string) {
        setExpandedSources(prev => ({
            ...prev,
            [requirementId]: {
                ...prev[requirementId],
                [filename]: !prev[requirementId]?.[filename]
            }
        }))
    }

    function toggleReg(requirementId: string, regText: string) {
        setExpandedRegs(prev => ({
            ...prev,
            [requirementId]: {
                ...prev[requirementId],
                [regText]: !prev[requirementId]?.[regText]
            }
        }))
    }

    return (
        <>
            {requirements.length > 0 ? (
                <div className='w-full flex flex-col gap-4'>
                    {requirements.map((r, ind) => {
                        const groupedSources = groupSources(r.sources || [])
                        const groupedRegs = groupRegulations(r.regulations || [])

                        return (
                            <div
                                id={r.requirement_id}
                                key={r.requirement_id}
                                className='relative p-2 shadow-md shadow-black/30 dark:shadow-black/50 rounded-lg scroll-mt-[210px]'
                            >
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

                                <div className='flex flex-col gap-4 mt-4'>
                                    {/* Sources */}
                                    {Object.keys(groupedSources).length > 0 && (
                                        <div>
                                            <h3 className='font-semibold'>Sources</h3>
                                            <ul className='flex flex-col gap-2'>
                                                {Object.entries(groupedSources).map(([filename, snippets], idx) => {
                                                    const source = filename.split('_')?.[1] || filename.split('_')?.[0]
                                                    const expanded = expandedSources[r.requirement_id]?.[filename] || false
                                                    return (
                                                        <li key={idx} className='list-disc ml-5'>
                                                            <button
                                                                onClick={() => toggleSource(r.requirement_id, filename)}
                                                                className='text-left underline cursor-pointer'
                                                            >
                                                                {source}
                                                            </button>
                                                            {expanded && (
                                                                <ul className='ml-4 mt-1 flex flex-col gap-1 text-xs'>
                                                                    {snippets.map((s, i) => (
                                                                        <li key={i} className='list-disc ml-2'>{s}</li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Regulations */}
                                    {Object.keys(groupedRegs).length > 0 && (
                                        <div>
                                            <h3 className='font-semibold'>Regulations</h3>
                                            <ul className='flex flex-col gap-2'>
                                                {Object.entries(groupedRegs).map(([regText, snippets], idx) => {
                                                    const expanded = expandedRegs[r.requirement_id]?.[regText] || false
                                                    return (
                                                        <li key={idx} className='list-disc ml-5'>
                                                            <button
                                                                onClick={() => toggleReg(r.requirement_id, regText)}
                                                                className='text-left underline cursor-pointer'
                                                            >
                                                                {regText}
                                                            </button>
                                                            {expanded && (
                                                                <ul className='ml-4 mt-1 flex flex-col gap-1 text-xs'>
                                                                    {snippets.map((s, i) => (
                                                                        <li key={i} className='list-disc ml-2'>{s}</li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p>No requirements found.</p>
            )}
        </>
    )
}
