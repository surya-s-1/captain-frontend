'use client'

import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { RootState } from '@/lib/store'
import { pushMessage } from '@/lib/slices/chat'
import { clearMessages } from '@/lib/slices/chat'

const MODEL_ENDPOINT = process.env.NEXT_PUBLIC_MODEL_ENDPOINT

export default function ChatMessages() {
    const dispatch = useDispatch()

    const appUser = useSelector((state: RootState) => state.user)
    const messages = useSelector((state: RootState) => state.chat.messages)

    useEffect(() => {
        dispatch(clearMessages())

        const fetchHistory = async () => {
            try {
                const res = await fetch(`${MODEL_ENDPOINT}/chat-history`)
                if (!res.ok) return

                const data = await res.json()

                if (Array.isArray(data)) {
                    data.forEach(msg => {
                        dispatch(pushMessage(msg))
                    })
                }
            } catch (e) {
                console.error(e)
            }
        }

        fetchHistory()
    }, [])

    return (
        <div className='w-full flex-1 space-y-2 overflow-y-auto scrollbar-hide'>
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
                <div className='flex flex-col gap-2 p-4'>
                    {messages.map((msg) => (
                        <div key={msg.msg_id} className={`rounded-lg px-4 py-2 max-w-xl ${msg.role === 'user' ? 'self-end bg-tertiary text-black-500' : 'self-start bg-primary text-color-primary'}`}>
                            {msg.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}