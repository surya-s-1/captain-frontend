'use client'

import { Eye, EyeOff } from 'lucide-react'

import { useTabFilter } from '@/hooks/useTabFilter'
import { usePagination } from '@/hooks/usePagination'

import { Testcase } from '@/components/projects/versions/details/testcases/card'

import { ExpandingButton } from '@/lib/utility/ui/ExpandingButton'
import { CHANGE_ANALYSIS_STATUS, getNoticeMessage } from '@/lib/utility/constants'
import { ExpandingSearchBar, SearchSuggestions, useSearch } from '@/hooks/useSearch'
import { useState } from 'react'

export interface TestCaseInterface {
    testcase_id: string
    title: string
    description: string
    acceptance_criteria: string
    priority: string
    requirement_id: string
    deleted: boolean
    change_analysis_status: string | null
    change_analysis_status_reason: string | null
    toolCreated: string | null
    toolIssueKey: string | null
    toolIssueLink: string | null
    dataset_status: string | null
    datasets: string[] | null
}

interface TestCasesProps {
    projectId: string
    version: string
    latestVersion: boolean
    toolName: string
    status: string
    testcases: TestCaseInterface[]
    TestcasesFilterPopup: any
    TestcasesFilterButton: any
    hideDetails: boolean
    setHideDetails: React.Dispatch<React.SetStateAction<boolean>>
}


export default function TestCases({
    projectId,
    version,
    latestVersion,
    toolName,
    status,
    testcases,
    TestcasesFilterPopup,
    TestcasesFilterButton,
    hideDetails,
    setHideDetails
}: TestCasesProps) {
    const testcasesPerPage = 30

    const {
        filteredItems: filteredTestcases,
        uniqueValues,
        config,
        selectedValue,
        setSelectedValue,
        TabFilterComponent
    } = useTabFilter(testcases,
        {
            field: 'change_analysis_status',
            valueLabels: {
                [CHANGE_ANALYSIS_STATUS.NEW]: 'New',
                [CHANGE_ANALYSIS_STATUS.UNCHANGED]: 'Unchanged',
                [CHANGE_ANALYSIS_STATUS.DEPRECATED]: 'Deprecated'
            },
            valueColors: {
                [CHANGE_ANALYSIS_STATUS.NEW]: 'bg-[#008000]/50 text-white',
                [CHANGE_ANALYSIS_STATUS.UNCHANGED]: 'bg-[#0000FF]/50 text-white',
                [CHANGE_ANALYSIS_STATUS.DEPRECATED]: 'bg-[#FF0000]/50 text-white'
            }
        })

    const [searchText, setSearchText] = useState('')
    const [selectedItem, setSelectedItem] = useState<TestCaseInterface | null>(null)
    const showSuggestions = searchText.length > 0 && selectedItem?.title !== searchText

    const handleSelectSuggestion = (item: TestCaseInterface) => {
        setSelectedItem(item)
        setSearchText(item.title)
    }

    const { searchResults } = useSearch(filteredTestcases, searchText)

    const { currentItems: currentTestcases, Pagination } = usePagination(searchResults, testcasesPerPage)

    return (
        <div className='w-full flex flex-col gap-8 items-center'>
            <div className={`w-full sticky top-[215px] z-30`}>
                <div className='w-full relative flex items-center justify-center'>
                    <TabFilterComponent
                        uniqueValues={uniqueValues}
                        config={config}
                        selectedValue={selectedValue}
                        setSelectedValue={setSelectedValue}
                    />
                    <div className='absolute right-24'>
                        <div className='flex items-start gap-2'>
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
                                    placeholder='Search Testcases...'
                                    size='md'
                                    className='w-full'
                                />
                                {showSuggestions && (
                                    <div className='absolute top-full left-0 w-full z-30'>
                                        <SearchSuggestions<TestCaseInterface>
                                            searchResults={searchResults}
                                            onSelectSuggestion={handleSelectSuggestion}
                                            renderSuggestion={(item) => (
                                                <div className='flex justify-between items-center'>
                                                    <span
                                                        className='font-semibold text-gray-700 truncate'
                                                        title={`(${item.testcase_id}) ${item.title}`}
                                                    >
                                                        {item.title}
                                                    </span>
                                                    <span className='text-xs font-mono text-indigo-500 ml-4 flex-shrink-0'>
                                                        {item.testcase_id}
                                                    </span>
                                                </div>
                                            )}
                                            maxSuggestions={50}
                                        />
                                    </div>
                                )}
                            </div>
                            <ExpandingButton
                                Icon={hideDetails ? Eye : EyeOff}
                                openLabel={hideDetails ? 'Show Details' : 'Hide Details'}
                                onClick={() => setHideDetails(prev => !prev)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {currentTestcases.length > 0 ? (
                <div className='w-full flex flex-col gap-4 mb-12'>
                    {currentTestcases.map((t) => (
                        <Testcase
                            key={t.testcase_id}
                            testcase={t}
                            status={status}
                            projectId={projectId}
                            version={version}
                            latestVersion={latestVersion}
                            toolName={toolName}
                            hideDetails={hideDetails}
                        />
                    ))}
                </div>
            ) : (
                <p>No test cases found.</p>
            )}

            <div className={`w-full z-30 sticky ${getNoticeMessage(status).title ? 'bottom-24' : 'bottom-4'}`}>
                <div className='w-full relative flex items-center justify-center'>
                    <Pagination />
                    <div className='absolute right-24'>
                        <div className='relative'>
                            <TestcasesFilterButton />
                            <TestcasesFilterPopup />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}