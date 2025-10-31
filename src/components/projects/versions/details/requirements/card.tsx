'use client'

import { useState } from 'react'
import { FileDiff, CircleQuestionMark, MoveUpRight, RefreshCcwDot, RefreshCcw } from 'lucide-react'

import Dropdown from '@/lib/utility/ui/Dropdown'
import { Markdown } from '@/lib/utility/ui/Markdown'
import { ExpandingButton, ExpandingLink } from '@/lib/utility/ui/ExpandingButton'

import { CHANGE_ANALYSIS_DROPDOWN_OPTIONS, CHANGE_ANALYSIS_STATUS, REQ_STATUS_MESSAGES } from '@/lib/utility/constants'
import { getCurrentUser } from '@/lib/firebase/utilities'

import { RequirementInterface, Source, Regulation } from './index'

import JIRA_ICON from '@/../public/Jira_icon.png'

export interface RequirementCardProps {
    projectId: string
    version: string
    requirement: RequirementInterface
    canToggleStatus: boolean
    canDelete: boolean
    toolName: string
}

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

export default function RequirementCard({
    projectId,
    version,
    requirement,
    canToggleStatus,
    canDelete,
    toolName
}: RequirementCardProps) {
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [toggleStatusLoading, setToggleStatusLoading] = useState(false)
    const [showPreviousVersion, setShowPreviousVersion] = useState(false)
    const [resyncInProgress, setResyncInProgress] = useState(false)
    const [recreateInProgress, setRecreateInProgress] = useState(false)

    const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({})
    const [expandedRegs, setExpandedRegs] = useState<Record<string, boolean>>({})

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

    async function toggleChangeAnalysisStatus(status: string) {
        if (toggleStatusLoading) return

        try {
            setToggleStatusLoading(true)
            const user = await getCurrentUser()
            const token = await user?.getIdToken()

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/${projectId}/v/${version}/changeAnalysisStatus/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    requirement_id: requirement.requirement_id,
                    new_status: status
                })
            })

            if (!response.ok) {
                console.error('Could not update change analysis status')
                alert('Could not update change analysis status')
            }
        } catch (err) {
            console.error(err)
            alert('Could not update change analysis status')
        } finally {
            setToggleStatusLoading(false)
        }
    }

    function groupSources(sources: Source[]) {
        const grouped: Record<string, { location: string, snippet: string }[]> = {}
        sources.forEach(src => {
            if (!grouped[src.file_name]) grouped[src.file_name] = []
            grouped[src.file_name].push({
                location: src.location,
                snippet: src.text_used
            })
        })
        return grouped
    }

    function toggleSource(filename: string) {
        setExpandedSources(prev => ({
            ...prev,
            [filename]: !prev[filename]
        }))
    }

    function toggleReg(regulation: string) {
        setExpandedRegs(prev => ({
            ...prev,
            [regulation]: !prev[regulation]
        }))
    }

    const groupedSources = groupSources(requirement.sources || [])

    async function recreateRequirement(req_id: string) {
        try {
            if (recreateInProgress) return

            setRecreateInProgress(true)

            const user = await getCurrentUser()
            if (!user) throw new Error('No user found')

            const token = await user.getIdToken()
            if (!token) throw new Error('No token found')

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/${projectId}/v/${version}/r/${req_id}/create/one`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!response.ok) alert(`Could not create the requirement`)
        } catch (err) {
            console.error(err)
            alert('Could not create the requirement')
        } finally {
            setRecreateInProgress(false)
        }
    }

    async function resyncRequirement(req_id: string) {
        try {
            if (resyncInProgress) return

            setResyncInProgress(true)

            const user = await getCurrentUser()
            if (!user) throw new Error('No user found')

            const token = await user.getIdToken()
            if (!token) throw new Error('No token found')

            const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/projects/v1/${projectId}/v/${version}/r/${req_id}/sync/one`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!response.ok) alert(`Could not sync the requirement`)
        } catch (err) {
            console.error(err)
            alert('Could not sync the requirement')
        } finally {
            setResyncInProgress(false)
        }
    }

    return (
        <div
            id={requirement.requirement_id}
            key={requirement.requirement_id}
            className='relative p-4 border-[1] border-gray-300 shadow-sm rounded-lg scroll-mt-[210px]'
        >
            <div className='w-full flex flex-col lg:flex-row gap-4 justify-between'>
                <div className='flex items-center gap-2'>
                    <h2 className='text-color-primary/50 text-sm mb-1'>
                        {requirement.requirement_id}
                        {requirement.requirement_category && ` (${requirement.requirement_category})`}
                    </h2>
                    {requirement.change_analysis_status &&
                        <Dropdown
                            options={CHANGE_ANALYSIS_DROPDOWN_OPTIONS}
                            value={requirement.change_analysis_status}
                            onChange={toggleChangeAnalysisStatus}
                            isLoading={toggleStatusLoading}
                            disabled={!canToggleStatus || ['IGNORED', 'NEW'].includes(requirement.change_analysis_status)}
                            size='xs'
                        />}
                    {requirement.change_analysis_status_reason &&
                        <div className='py-1 cursor-pointer' title={requirement.change_analysis_status_reason}>
                            <CircleQuestionMark className='w-4 h-4 text-gray-400' />
                        </div>}
                </div>
                <div className='flex items-center gap-2'>
                    {requirement.toolCreated === 'FAILED' &&
                        <>
                            <ExpandingButton
                                Icon={RefreshCcw}
                                openLabel='Retry Sync'
                                onClick={() => { resyncRequirement(requirement.requirement_id) }}
                                isLoading={resyncInProgress}
                            />
                            <ExpandingButton
                                Icon={RefreshCcwDot}
                                openLabel='Retry Create'
                                onClick={() => { recreateRequirement(requirement.requirement_id) }}
                                isLoading={recreateInProgress}
                            />
                        </>}

                    {requirement.toolIssueLink &&
                        <ExpandingLink
                            imageUrl={JIRA_ICON.src}
                            label={`Open in ${toolName}`}
                            href={requirement.toolIssueLink}
                            className='shadow-none hover:shadow-sm'
                        />}

                    {canDelete && (
                        <button
                            className='text-red-500 cursor-pointer disabled:opacity-50'
                            onClick={() => deleteRequirement(requirement.requirement_id)}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? 'Deleting...' : 'Remove'}
                        </button>
                    )}
                </div>
            </div>

            {requirement.source_type === 'implicit' &&
                <div className='flex items-center gap-1 flex-wrap text-color-primary/50 text-xs mb-1'>
                    <span>Derived for</span>
                    {requirement.parent_exp_req_ids.map((id, idx) => (
                        <a
                            href={`#${id}`}
                            key={idx}
                            target='_blank'
                            className='min-w-fit flex items-center gap-1 border-b-2 border-dotted'
                        >
                            <span>{id}</span>
                            <MoveUpRight size={14} />
                        </a>
                    ))}
                </div>}

            {requirement.testcase_status && (
                <p className='text-color-primary/50 text-xs mb-1'>
                    {REQ_STATUS_MESSAGES[requirement.testcase_status] || requirement.testcase_status}
                </p>
            )}

            <Markdown text={requirement.requirement} />

            {canToggleStatus &&
                [
                    CHANGE_ANALYSIS_STATUS.MODIFIED,
                    CHANGE_ANALYSIS_STATUS.UNCHANGED
                ].includes(requirement.change_analysis_status) &&
                <div
                    className='flex flex-col gap-1 bg-gray-300 rounded-lg w-fit px-2 py-1 cursor-pointer'
                    onClick={() => setShowPreviousVersion(!showPreviousVersion)}
                >
                    <div className='flex items-center gap-2 text-xs text-gray-500'>
                        <FileDiff className='w-3.5 h-3.5' />
                        <span>{showPreviousVersion ? 'Hide previous version' : 'See previous version'}</span>
                    </div>
                    {showPreviousVersion && requirement.history && requirement.history.length &&
                        <p>{requirement?.history?.[0]?.fields?.requirement || 'Sorry, data not available.'}</p>
                    }
                </div>}

            <div className='flex flex-col gap-4 mt-4'>
                {/* Sources */}
                {Object.keys(groupedSources).length > 0 && (
                    <div>
                        <h3 className='font-semibold'>Sources</h3>
                        <ul className='flex flex-col gap-2'>
                            {Object.entries(groupedSources).map(([filename, snippets], idx) => {
                                const expanded = expandedSources[filename] || false
                                const displayName = filename.split('_')?.[1] || filename
                                return (
                                    <li key={idx} className='list-disc ml-5'>
                                        <button
                                            onClick={() => toggleSource(filename)}
                                            className='text-left underline cursor-pointer'
                                        >
                                            {displayName}
                                        </button>
                                        {expanded && (
                                            <ul className='ml-4 mt-1 flex flex-col gap-1 text-xs'>
                                                {snippets.map((s, i) => (
                                                    <li key={i} className='list-disc ml-2'>
                                                        ({s.location}) {s.snippet}
                                                    </li>
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
                {requirement.regulations.length > 0 && (
                    <div>
                        <h3 className='font-semibold'>Regulations</h3>
                        <ul className='flex flex-col gap-2'>
                            {requirement.regulations.map((reg, idx) => {
                                const expanded = expandedRegs[reg.regulation] || false

                                if (!reg.regulation || !reg.source.filename || !reg.source.snippet) return <></>

                                return (
                                    <li key={idx} className='list-disc ml-5'>
                                        <button
                                            onClick={() => toggleReg(reg.regulation)}
                                            className='flex items-center gap-1 w-fit underline cursor-pointer'
                                        >
                                            {reg.regulation}
                                            <div title={`Relevance score: ${reg.source?.relevance_score?.toFixed(2)}`}>
                                                <CircleQuestionMark
                                                    className='w-4 h-4 text-gray-400'
                                                />
                                            </div>
                                        </button>
                                        {expanded && (
                                            <ul className='ml-4 mt-1 flex flex-col gap-1 text-xs'>
                                                <li className='list-disc ml-2'>
                                                    <strong>({reg.source.filename})</strong>
                                                    <br />
                                                    {reg.source.snippet}
                                                </li>
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
}