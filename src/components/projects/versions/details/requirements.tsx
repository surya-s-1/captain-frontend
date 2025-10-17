'use client'

import { useState, useEffect } from 'react'
import { TriangleAlert } from 'lucide-react'

import { getCurrentUser } from '@/lib/firebase/utilities'
import { Markdown } from '@/lib/utility/ui/Markdown'
import { REQ_STATUS_MESSAGES } from '@/lib/utility/constants'

import JIRA_ICON from '@/../public/Jira_icon.png'

interface Source {
    file_name: string
    location: string
    snippet: string
}

interface Regulation {
    regulation: string
    source: {
        filename: string
        page_start: string
        page_end: string
        raw_snippet: string
        snippet: string
        from_req_id: string
    }
}

export interface RequirementInterface {
    testcase_status: string | null
    created_at: Date
    deleted: boolean
    embedding: number[]
    exp_req_ids: string[]
    is_duplicate: boolean
    priority: string
    requirement: string
    requirement_id: string
    requirement_type: string
    source_type: string
    sources: Source[]
    regulations: Regulation[]
}

interface RequirementsProps {
    projectId: string
    version: string
    status: string
    requirements: RequirementInterface[]
    tool: string
}

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

export default function Requirements({
    projectId,
    version,
    status,
    requirements,
    tool
}: RequirementsProps) {

    const [deleteLoading, setDeleteLoading] = useState(false)
    const [expandedSources, setExpandedSources] = useState<Record<string, Record<string, boolean>>>({})
    const [expandedRegs, setExpandedRegs] = useState<Record<string, Record<string, boolean>>>({})
    const [currentPage, setCurrentPage] = useState(1)

    const requirementsPerPage = 30
    const totalPages = Math.ceil(requirements.length / requirementsPerPage)

    const indexOfLastReq = currentPage * requirementsPerPage
    const indexOfFirstReq = indexOfLastReq - requirementsPerPage
    const currentRequirements = requirements.slice(indexOfFirstReq, indexOfLastReq)

    const canDelete = status === 'CONFIRM_REQ_EXTRACT'

    useEffect(() => {
        if (requirements.length > 0 && window.location.hash) {
            const reqIndex = requirements.findIndex(r => `#${r.requirement_id}` === window.location.hash)

            if (reqIndex === -1) {
                alert(`Requirement ${window.location.hash} not found`)
                return
            }

            setCurrentPage(Math.ceil((reqIndex + 1) / requirementsPerPage))
            setTimeout(() => {
                const el = document.querySelector(window.location.hash)
                el?.scrollIntoView({ behavior: "smooth" })
            }, 500)
        }
    }, [requirements])

    async function deleteRequirement(reqId: string) {
        try {
            setDeleteLoading(true)
            const user = await getCurrentUser()
            if (!user) return
            const token = await user.getIdToken()
            if (!token) return

            const response = await fetch(
                `${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/${projectId}/v/${version}/r/${reqId}`,
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

    function groupSources(sources: Source[]) {
        const grouped: Record<string, string[]> = {}
        sources.forEach(src => {
            if (!grouped[src.file_name]) grouped[src.file_name] = []
            grouped[src.file_name].push(src.location)
        })
        return grouped
    }

    function groupRegulations(regulations: Regulation[]) {
        const grouped: Record<string, string[]> = {}
        regulations.forEach(reg => {
            if (!grouped[reg.regulation]) grouped[reg.regulation] = []
            grouped[reg.regulation].push(reg.source.raw_snippet)
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
        <div className='w-full flex flex-col gap-8 items-center'>
            {currentRequirements.length > 0 ? (
                <div className='w-full flex flex-col gap-4'>
                    {currentRequirements.map((r, ind) => {
                        const groupedSources = groupSources(r.sources || [])
                        const groupedRegs = groupRegulations(r.regulations || [])

                        return (
                            <div
                                id={r.requirement_id}
                                key={r.requirement_id}
                                className='relative p-2 shadow-md shadow-black/30 dark:shadow-black/50 rounded-lg scroll-mt-[195px]'
                            >
                                <div className='w-full flex flex-col lg:flex-row gap-4 justify-between'>
                                    <h2 className='text-color-primary/50 text-sm mb-1'>
                                        {r.requirement_id}{r.requirement_type && ` (${r.requirement_type})`}
                                    </h2>
                                    <div className='flex items-center gap-2'>
                                        {canDelete && (
                                            <button
                                                className='text-red-500 cursor-pointer'
                                                onClick={() => deleteRequirement(r.requirement_id)}
                                                disabled={deleteLoading}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {r.testcase_status &&
                                    <p className='text-color-primary/50 text-xs mb-1'>
                                        {REQ_STATUS_MESSAGES[r.testcase_status] || r.testcase_status}
                                    </p>}

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
            {requirements.length > requirementsPerPage && (
                <div className='sticky bottom-4 w-fit bg-secondary rounded-md shadow-md flex justify-center items-center gap-4 mt-8'>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className='bg-primary px-4 py-2 rounded-md shadow-md cursor-pointer disabled:opacity-50'
                    >
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className='bg-primary px-4 py-2 rounded-md shadow-md cursor-pointer disabled:opacity-50'
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}
