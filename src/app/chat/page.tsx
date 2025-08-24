'use client'

import React, { useState } from 'react'
import ChatInput from '@/components/chat/input'
import ChatMessages from '@/components/chat/messages'

export default function Chat() {
    const [autoScroll, setAutoScroll] = useState(true)

    return(
        <div className='flex flex-col items-center w-screen lg:w-[60%] h-full scrollbar-none overflow-hidden md:pb-6'>
            <ChatMessages autoScroll={autoScroll} setAutoScroll={setAutoScroll} />
            <ChatInput setAutoScroll={setAutoScroll} />
        </div>
    )
}