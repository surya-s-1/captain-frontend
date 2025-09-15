'use client'

import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Send, Loader2 } from 'lucide-react'

import { RootState } from '@/lib/store'
import { pushMessage, setSessionId } from '@/lib/slices/askCaptain'
import { getCurrentUser } from '@/lib/firebase/utilities'

const AGENT_ENDPOINT = process.env.NEXT_PUBLIC_AGENT_ENDPOINT

export default function ChatInput({ setAutoScroll }) {
    const [inputValue, setInputValue] = useState('')
    const [loading, setLoading] = useState<boolean>(false)

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const sessionId = useSelector((state: RootState) => state.askCaptain.sessionId)
    const dispatch = useDispatch()

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            const newHeight = Math.min(textareaRef.current.scrollHeight, 150)
            textareaRef.current.style.height = `${newHeight}px`
        }
    }, [inputValue])

    const handleSend = async () => {
        if (loading) return

        if (inputValue.trim() !== '') {
            setLoading(true)
            setAutoScroll(true)

            const user = await getCurrentUser()
            const token = await user.getIdToken()

            const queryRes = await fetch(`${AGENT_ENDPOINT}/query`, {
                method: 'POST',
                body: JSON.stringify({ query: inputValue }),
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Session-Id': sessionId || ''
                }
            })

            if (!queryRes.ok) {
                alert('Failed to send message.')
                setLoading(false)
                return
            }

            const msg_id = await queryRes.text()
            let receivedSessionId = queryRes.headers.get('X-Session-Id')
            dispatch(setSessionId(receivedSessionId))

            const newMsg = {
                msg_id,
                text: inputValue,
                timestamp: new Date().toISOString(),
                role: 'user',
                session_id: receivedSessionId
            }

            dispatch(pushMessage(newMsg))
            setInputValue('')

            const modelRes = await fetch(`${AGENT_ENDPOINT}/response`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Session-Id': receivedSessionId
                }
            })

            if (!modelRes.ok) {
                alert('Failed to get response.')
                setLoading(false)
                return
            }

            const { msg_id: modelMsgId, text: modelMsgText } = await modelRes.json()
            receivedSessionId = modelRes.headers.get('X-Session-Id')

            const modelMsg = {
                msg_id: modelMsgId,
                text: modelMsgText,
                timestamp: new Date().toISOString(),
                role: 'model',
                session_id: receivedSessionId
            }

            dispatch(pushMessage(modelMsg))
            dispatch(setSessionId(receivedSessionId))
            setLoading(false)
        }
    }

    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className='flex gap-2 relative bottom-0 z-10 w-full h-fit p-4 bg-secondary rounded-2xl'>
            <textarea
                className='w-full p-0 mb-2 outline-0 resize-none overflow-y-auto scrollbar'
                autoFocus
                ref={textareaRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder='Ask Captain'
                rows={1}
            />
            {!loading ?
                <button
                    onClick={handleSend}
                    className={`flex gap-2 p-2 w-fit h-fit bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full cursor-pointer transition-all duration-300`}
                    aria-label='Send message'
                    type='button'
                >
                    <Send size={20} />
                    <span className='text-sm'>Send</span>
                </button> :
                <Loader2 className='animate-spin' size={20} />
            }
        </div>
    )
}