'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { Markdown } from '@/lib/utility/ui/Markdown'

import { getCurrentUser } from '@/lib/firebase/utilities'
import { RootState } from '@/lib/store'
import { clearMessages, pushMessage } from '@/lib/slices/chat'

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
        // if (messages.length === 0) {
        dispatch(clearMessages())
        fetchHistory()
        // }
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
        <div className='w-full flex flex-col flex-1 gap-2 max-h-full overflow-y-auto scrollbar'>
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

                        const className = `
                            mx-4 md:mx-0 px-4 py-2 w-fit max-w-full rounded-xl
                            ${msg.role === 'user' ?
                                'self-end bg-tertiary text-black-500 max-w-[70%] rounded-br-none' :
                                'self-start bg-primary text-color-primary'}
                        `

                        if (msg.text.startsWith('[error]:')) {
                            return (
                                <div key={idx} className={`${className} text-red-500`}>
                                    <Markdown text={msg.text.replaceAll('[error]:', '')} />
                                </div>
                            )
                        }

                        return (
                            msg.text ?
                                <div
                                    key={idx}
                                    className={className}
                                    style={{ wordWrap: 'break-word' }}
                                >
                                    <Markdown text={msg.text} />
                                </div> :
                                <></>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </div>
    )
}