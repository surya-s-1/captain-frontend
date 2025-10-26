'use client'

import { useEffect } from 'react'
import { Info } from 'lucide-react'

import { useFilter } from '@/hooks/useFilter'
import { useTabFilter } from '@/hooks/useTabFilter'
import { usePagination } from '@/hooks/usePagination'

import RequirementCard from '@/components/projects/versions/details/requirements/card'

import { CHANGE_ANALYSIS_STATUS } from '@/lib/utility/constants'

export interface Source {
    file_name: string
    location: string
    text_used: string
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
    latestVersion: boolean
    status: string
    requirements: RequirementInterface[]
    toolName: string
}

export default function Requirements({
    projectId,
    version,
    latestVersion,
    status,
    requirements,
    toolName
}: RequirementsProps) {
    const reqsPerPage = 30
    const canToggleStatus = status === 'CONFIRM_CHANGE_ANALYSIS_EXPLICIT' && latestVersion
    const canDelete = status === 'CONFIRM_REQ_EXTRACT' && latestVersion

    const { filteredItems: filteredRequirements, FilterComponent } = useFilter({
        items: requirements,
        config: {
            requirement_id: {
                type: 'singleSearch',
                label: 'Requirement ID'
            },
            source_type: {
                type: 'single',
                label: 'Source',
                options: [
                    {
                        label: 'Explicit',
                        value: 'explicit'
                    },
                    {
                        label: 'Implicit',
                        value: 'implicit'
                    }
                ]
            }
        }
    })

    const {
        filteredItems: refilteredRequirements,
        uniqueValues,
        config,
        selectedValue,
        setSelectedValue,
        TabFilterComponent
    } = useTabFilter(filteredRequirements,
        {
            field: 'change_analysis_status',
            valueLabels: {
                [CHANGE_ANALYSIS_STATUS.NEW]: 'New',
                [CHANGE_ANALYSIS_STATUS.UNCHANGED]: 'Unchanged',
                [CHANGE_ANALYSIS_STATUS.DEPRECATED]: 'Deprecated',
                [CHANGE_ANALYSIS_STATUS.IGNORED]: 'Ignored',
                [CHANGE_ANALYSIS_STATUS.MODIFIED]: 'Modified'
            },
            valueColors: {
                [CHANGE_ANALYSIS_STATUS.NEW]: 'bg-[#008000]/50 text-white',
                [CHANGE_ANALYSIS_STATUS.UNCHANGED]: 'bg-[#0000FF]/50 text-white',
                [CHANGE_ANALYSIS_STATUS.DEPRECATED]: 'bg-[#FF0000]/50 text-white',
                [CHANGE_ANALYSIS_STATUS.IGNORED]: 'bg-[#000000]/50 text-white',
                [CHANGE_ANALYSIS_STATUS.MODIFIED]: 'bg-[#FFA500] text-white'
            }
        })

    const { currentItems: currentRequirements, Pagination, goToPage } = usePagination(refilteredRequirements, reqsPerPage)

    useEffect(() => {
        if (requirements.length > 0 && window.location.hash) {
            const reqIndex = requirements.findIndex(r => `#${r.requirement_id}` === window.location.hash)

            if (reqIndex === -1) {
                alert(`Requirement ${window.location.hash} not found`)
                return
            }

            goToPage(Math.ceil((reqIndex + 1) / reqsPerPage))
            setTimeout(() => {
                const el = document.querySelector(window.location.hash)
                el?.scrollIntoView({ behavior: 'smooth' })
            }, 500)
        }
    }, [requirements])

    return (
        <div className='w-full flex flex-col gap-8 items-center'>
            <div className='sticky top-[210px] z-30'>
                <TabFilterComponent
                    uniqueValues={uniqueValues}
                    config={config}
                    selectedValue={selectedValue}
                    setSelectedValue={setSelectedValue}
                />
            </div>
            {canToggleStatus &&
                <div className='sticky top-[260px] flex items-center gap-2 w-full bg-yellow-300 border shadow-sm p-2 rounded-lg z-50'>
                    <Info className='w-6 h-6' />
                    <span>Showing only explicitly provided requirements for delta analysis review.</span>
                </div>}
            {currentRequirements.length > 0 ? (
                <div className='w-full flex flex-col gap-4 mb-12'>
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

            <div className={`w-full z-30 sticky ${status.startsWith('CONFIRM_') ? 'bottom-24' : 'bottom-4'}`}>
                <div className='w-full relative flex items-center justify-center'>
                    <Pagination />
                    <div className='absolute right-24'>
                        <FilterComponent />
                    </div>
                </div>
            </div>
        </div>
    )
}