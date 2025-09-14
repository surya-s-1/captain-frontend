'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { Markdown } from '@/lib/utility/ui/Markdown'

import { getCurrentUser } from '@/lib/firebase/utilities'
import { RootState } from '@/lib/store'
import { clearMessages, pushMessage } from '@/lib/slices/askCaptain'

const AGENT_ENDPOINT = process.env.NEXT_PUBLIC_AGENT_ENDPOINT

export default function ChatMessages({ autoScroll, setAutoScroll }) {
    const dispatch = useDispatch()

    const appUser = useSelector((state: RootState) => state.user)
    const messages = useSelector((state: RootState) => state.askCaptain.messages)
    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const [showLoadMore, setShowLoadMore] = useState(true)

    useEffect(() => {
        if (messagesEndRef.current && autoScroll) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, autoScroll])

    useEffect(() => {
        dispatch(clearMessages())
        fetchHistory()
    }, [])

    const fetchHistory = async (msgId: string | null = null) => {
        try {
            const user = await getCurrentUser()

            if (!user) return

            const token = await user.getIdToken()

            const url = msgId ? `${AGENT_ENDPOINT}/chat-history?msg_id=${msgId}` : `${AGENT_ENDPOINT}/chat-history`

            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            })

            if (!res.ok) return

            const data = await res.json()

            if (Array.isArray(data)) {
                if (data.length === 0) {
                    setShowLoadMore(false)
                } else {
                    data.forEach(msg => {
                        dispatch(pushMessage(msg))
                    })
                }
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className='w-full flex flex-col flex-1 gap-2 max-h-full overflow-y-auto scrollbar'>
            {messages.length === 0 ? (
                <div className='flex w-full h-full items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent text-7xl pb-52'>
                    {appUser.name ? (
                        <div>
                            Hello,<br />
                            {appUser.name}!
                        </div>
                    ) : (
                        'Hello!'
                    )}
                </div>
            ) : (
                <div className='flex flex-col flex-1 overflow-y-auto gap-2 md:p-4 scrollbar'>
                    {showLoadMore ? (
                        <button
                            onClick={() => {
                                fetchHistory(messages?.[0]?.msg_id || null)
                                setAutoScroll(false)
                            }}
                            className='self-center px-2 py-1 rounded-lg  cursor-pointer
                                    bg-transparent text-color-primary/50 hover:text-color-primary'
                        >
                            Load More Messages
                        </button>
                    ) : (
                        <span
                            className='self-center px-2 py-1 rounded-lg bg-transparent text-color-primary/50'
                        >
                            No more messages
                        </span>
                    )}

                    {messages.map((msg, idx) => {
                        if (!msg.text) return <></>

                        const isNewSession =
                            idx === 0 || msg.session_id !== messages[idx - 1]?.session_id

                        const className = `
                            mx-4 md:mx-0 px-4 py-2 w-fit max-w-full rounded-xl
                            ${msg.role === 'user'
                                ? 'self-end bg-tertiary text-black-500 max-w-[70%] rounded-br-none'
                                : 'self-start bg-primary text-color-primary'}`

                        return (
                            <React.Fragment key={msg.msg_id || idx}>
                                {isNewSession && (
                                    <div className='w-full my-1 flex items-center justify-center text-sm text-color-primary/50'>
                                        New Session
                                    </div>
                                )}

                                {msg.text.startsWith('[error]:') ? (
                                    <div className={`${className} text-red-500`}>
                                        <Markdown text={msg.text.replaceAll('[error]:', '')} />
                                    </div>
                                ) : (
                                    <div
                                        className={className}
                                        style={{ wordWrap: 'break-word' }}
                                    >
                                        <Markdown text={msg.text} />
                                    </div>
                                )}
                            </React.Fragment>
                        )
                    })}

                    <div ref={messagesEndRef} />
                </div>
            )}
        </div>
    )
}