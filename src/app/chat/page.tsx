'use client'

import React, { useState } from 'react'
import ChatInput from '@/components/chat/input'
import ChatMessages from '@/components/chat/messages'

export default function Chat() {
    const [autoScroll, setAutoScroll] = useState(true)

    return(
        <div className='w-[60%] h-screen flex flex-col items-center scrollbar-none overflow-hidden pb-6'>
            <ChatMessages autoScroll={autoScroll} setAutoScroll={setAutoScroll} />
            <ChatInput setAutoScroll={setAutoScroll} />
        </div>
    )
}