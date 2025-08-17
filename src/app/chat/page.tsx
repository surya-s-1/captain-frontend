'use client'

import React from 'react'
import ChatInput from '@/components/chat/input'
import ChatMessages from '@/components/chat/messages'

export default function Chat() {
    return(
        <div className='w-[60%] h-screen flex flex-col items-center scrollbar-none overflow-hidden pb-2'>
            <ChatMessages />
            <ChatInput />
        </div>
    )
}