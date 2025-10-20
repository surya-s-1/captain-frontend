'use client'

import { useState, useEffect } from 'react'
import { Info } from 'lucide-react'
import RequirementCard from './card'

export interface Source {
    file_name: string
    location: string
    snippet: string
}

export interface Regulation {
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

export interface RequirementInterfaceBase {
    requirement_id: string
    requirement: string
    requirement_type: string
    source_type: 'explicit' | 'implicit'
    deleted: boolean
    duplicate: boolean
    near_duplicate_id: string | null
    change_analysis_status: string | null
    change_analysis_status_reason: string | null
    change_analysis_near_duplicate_id: string | null
    sources: Source[]
    regulations: Regulation[]
    exp_req_ids: string[]
    testcase_status: string | null
    updated_at: Date | null
    created_at: Date
}

export interface RequirementHistoryEntry {
    version: string
    fields: RequirementInterfaceBase
    copied_at: Date
}

export interface RequirementInterface extends RequirementInterfaceBase {
    history: RequirementHistoryEntry[] | null
}

interface RequirementsProps {
    projectId: string
    version: string
    status: string
    requirements: RequirementInterface[]
    tool: string
}

export default function Requirements({
    projectId,
    version,
    status,
    requirements,
    tool
}: RequirementsProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [showReqs, setShowReqs] = useState<RequirementInterface[]>([])

    const requirementsPerPage = 30
    const totalPages = Math.ceil(showReqs.length / requirementsPerPage)

    const indexOfLastReq = currentPage * requirementsPerPage
    const indexOfFirstReq = indexOfLastReq - requirementsPerPage
    const currentRequirements = showReqs.slice(indexOfFirstReq, indexOfLastReq)

    const canToggleStatus = status === 'CONFIRM_CHANGE_ANALYSIS_EXPLICIT'
    const canDelete = status === 'CONFIRM_REQ_EXTRACT'

    useEffect(() => {
        if (status === 'CONFIRM_CHANGE_ANALYSIS_EXPLICIT') {
            setShowReqs(requirements.filter(r => r.source_type !== 'implicit'))
        } else {
            setShowReqs(requirements)
        }
    }, [requirements, status])

    useEffect(() => {
        if (showReqs.length > 0 && window.location.hash) {
            const reqIndex = showReqs.findIndex(r => `#${r.requirement_id}` === window.location.hash)

            if (reqIndex === -1) {
                alert(`Requirement ${window.location.hash} not found`)
                return
            }

            setCurrentPage(Math.ceil((reqIndex + 1) / requirementsPerPage))
            setTimeout(() => {
                const el = document.querySelector(window.location.hash)
                el?.scrollIntoView({ behavior: 'smooth' })
            }, 500)
        }
    }, [showReqs])

    return (
        <div className='w-full flex flex-col gap-8 items-center'>
            {canToggleStatus &&
                <div className='sticky top-[210px] flex items-center gap-2 w-full bg-yellow-300 shadow-sm p-2 rounded-lg z-50'>
                    <Info className='w-6 h-6' />
                    <span>Showing only explicit requirements.</span>
                </div>}
            {currentRequirements.length > 0 ? (
                <div className='w-full flex flex-col gap-4'>
                    {currentRequirements.map(r => (
                        <RequirementCard
                            key={r.requirement_id}
                            projectId={projectId}
                            version={version}
                            requirement={r}
                            canToggleStatus={canToggleStatus}
                            canDelete={canDelete}
                        />
                    ))}
                </div>
            ) : (
                <p>No requirements found.</p>
            )}

            {showReqs.length > requirementsPerPage && (
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