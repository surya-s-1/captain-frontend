'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import breaks from 'remark-breaks'

import { getCurrentUser } from '@/lib/firebase/utilities'
import { RootState } from '@/lib/store'
import { pushMessage } from '@/lib/slices/chat'

const MODEL_ENDPOINT = process.env.NEXT_PUBLIC_MODEL_ENDPOINT

export default function ChatMessages({ autoScroll, setAutoScroll }) {
    const dispatch = useDispatch()

    const appUser = useSelector((state: RootState) => state.user)
    const messages = useSelector((state: RootState) => state.chat.messages)
    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const [showLoadMore, setShowLoadMore] = useState(true)

    useEffect(() => {
        if (messagesEndRef.current && autoScroll) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, autoScroll])

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async (msgId: string | null = null) => {
        try {
            const user = await getCurrentUser()

            if (!user) return

            const token = await user.getIdToken()
            const url = msgId ? `${MODEL_ENDPOINT}/chat-history?msg_id=${msgId}` : `${MODEL_ENDPOINT}/chat-history`

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
                    // Prepend new messages if loading more, otherwise just push
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
        <div className='w-full flex-1 space-y-2 overflow-y-auto scrollbar' style={{ display: 'flex', flexDirection: 'column' }}>
            {messages.length === 0 ? (
                <div className='flex w-full h-full items-center justify-center bg-primary text-color-primary/50 text-7xl pb-52'>
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
                <div className='flex flex-col gap-2 p-4 scrollbar' style={{ flex: 1, overflowY: 'auto' }}>
                    {showLoadMore && (
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
                    )}

                    {messages.map((msg) => {
                        const cleanText = msg.role === 'model' ? msg.text.replaceAll('[text]:', '') : msg.text

                        return (
                            <div key={msg.msg_id} className={`
                                px-4 py-2 w-fit max-w-full 
                                ${msg.role === 'user' ?
                                    'self-end bg-tertiary text-black-500 max-w-[70%] rounded-xl rounded-br-none' :
                                    'self-start bg-primary text-color-primary'}
                                `}>
                                <ReactMarkdown remarkPlugins={[remarkGfm, breaks]}>
                                    {cleanText}
                                </ReactMarkdown>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </div>
    )
}