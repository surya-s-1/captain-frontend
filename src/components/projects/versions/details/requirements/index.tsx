'use client'

import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'

import { useSearch, ExpandingSearchBar, SearchSuggestions } from '@/hooks/useSearch'
import { useTabFilter } from '@/hooks/useTabFilter'
import { usePagination } from '@/hooks/usePagination'

import RequirementCard from '@/components/projects/versions/details/requirements/card'

import { CHANGE_ANALYSIS_STATUS, getNoticeMessage } from '@/lib/utility/constants'

export interface Source {
    file_name: string
    location: string
    text_used: string
}

export interface Regulation {
    regulation: string | null
    source: {
        filename: string | null
        snippet: string | null
        relevance_score: number | null
    }
}

export interface RequirementInterfaceBase {
    requirement_id: string
    requirement: string
    requirement_category: string
    source_type: 'explicit' | 'implicit'
    sources: Source[]
    deleted: boolean
    duplicate: boolean
    near_duplicate_id: string | null
    change_analysis_status: string | null
    change_analysis_status_reason: string | null
    change_analysis_near_duplicate_id: string | null
    regulations: Regulation[]
    parent_exp_req_ids: string[]
    testcase_status: string | null
    updated_at: Date | null
    created_at: Date
    toolCreated: string | null
    toolIssueKey: string | null
    toolIssueLink: string | null
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
    RequirementsFilterPopup: any
    RequirementsFilterButton: any
    toolName: string
}

export default function Requirements({
    projectId,
    version,
    latestVersion,
    status,
    requirements,
    RequirementsFilterPopup,
    RequirementsFilterButton,
    toolName
}: RequirementsProps) {
    const reqsPerPage = 30
    const canToggleStatus = status === 'CONFIRM_CHANGE_ANALYSIS_EXPLICIT' && latestVersion
    const canDelete = ['CONFIRM_EXP_REQ_EXTRACT', 'CONFIRM_IMP_REQ_EXTRACT', 'CONFIRM_REQ_EXTRACT'].includes(status) && latestVersion

    const {
        filteredItems: filteredRequirements,
        uniqueValues,
        config,
        selectedValue,
        setSelectedValue,
        TabFilterComponent
    } = useTabFilter(requirements,
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

    const [searchText, setSearchText] = useState('')
    const [selectedItem, setSelectedItem] = useState<RequirementInterface | null>(null)
    const showSuggestions = searchText.length > 0 && selectedItem?.requirement !== searchText

    const handleSelectSuggestion = (item: RequirementInterface) => {
        setSelectedItem(item)
        setSearchText(item.requirement)
    }

    const { searchResults } = useSearch(filteredRequirements, searchText)
    const { currentItems: currentRequirements, Pagination, goToPage } = usePagination(searchResults, reqsPerPage)

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
            <div className='w-full sticky top-[215px] z-30'>
                <div className='w-full relative flex items-center justify-center'>
                    <TabFilterComponent
                        uniqueValues={uniqueValues}
                        config={config}
                        selectedValue={selectedValue}
                        setSelectedValue={setSelectedValue}
                    />
                    <div className='absolute right-24'>
                        <div className='relative'>
                            <ExpandingSearchBar
                                searchText={searchText}
                                onSearchTextChange={(text) => {
                                    setSearchText(text)
                                    setSelectedItem(null)
                                }}
                                onClear={() => {
                                    setSearchText('')
                                    setSelectedItem(null)
                                }}
                                placeholder='Search Requirements...'
                                size='md'
                                className='w-full'
                            />

                            {showSuggestions && (
                                <div className='absolute top-full left-0 w-full z-30'>
                                    <SearchSuggestions<RequirementInterface>
                                        searchResults={searchResults}
                                        onSelectSuggestion={handleSelectSuggestion}
                                        renderSuggestion={(item) => (
                                            <div className='flex justify-between items-center'>
                                                <span
                                                    className='font-semibold text-gray-700 truncate'
                                                    title={`(${item.requirement_id}) ${item.requirement}`}
                                                >
                                                    {item.requirement}
                                                </span>
                                                <span className='text-xs font-mono text-indigo-500 ml-4 flex-shrink-0'>
                                                    {item.requirement_category}
                                                </span>
                                            </div>
                                        )}
                                        maxSuggestions={50}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {canToggleStatus &&
                <div className='sticky top-[260px] flex items-center gap-2 w-fit bg-yellow-300 border shadow-sm p-2 rounded-lg z-20'>
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
                            toolName={toolName}
                        />
                    ))}
                </div>
            ) : (
                <p>No requirements found.</p>
            )}

            <div className={`w-full z-30 sticky ${getNoticeMessage(status).title ? 'bottom-24' : 'bottom-4'}`}>
                <div className='w-full relative flex items-center justify-center'>
                    <Pagination />
                    <div className='absolute right-24'>
                        <div className='relative'>
                            <RequirementsFilterButton />
                            <RequirementsFilterPopup />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}