'use client'

import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { Paperclip, Camera, Send } from 'lucide-react'

export default function ChatInput() {
    const [inputValue, setInputValue] = useState('')
    const textareaRef = useRef(null)

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            const newHeight = Math.min(textareaRef.current.scrollHeight, 150)
            textareaRef.current.style.height = `${newHeight}px`
        }
    }, [inputValue])

    const handleFileUpload = () => {
        console.log('File upload button clicked')
    }

    const handleCapture = () => {
        console.log('Capture image/video button clicked')
    }

    const handleSend = () => {
        if (inputValue.trim() !== '') {
            console.log('Sending message:', inputValue)
            setInputValue('')
        }
    }

    return (
        <div className='w-full h-fit p-4 bg-secondary rounded-2xl'>
            <textarea
                className='w-full p-0 mb-2 outline-0 resize-none overflow-y-auto scrollbar'
                ref={textareaRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder='Ask Beta'
                rows={1}
            />
            <div className='flex justify-between items-center'>
                <div className='flex gap-2'>
                    <button
                        onClick={handleFileUpload}
                        className='flex gap-2 bg-tertiary hover:bg-quaternary rounded-full p-2 cursor-pointer transition-all duration-200'
                        aria-label='Upload file'
                    >
                        <Paperclip size={20} />
                        <span className='text-sm'>Upload</span>
                    </button>
                    <button
                        onClick={handleCapture}
                        className='flex gap-2 bg-tertiary hover:bg-quaternary rounded-full p-2 cursor-pointer transition-all duration-200'
                        aria-label='Capture image or video'
                    >
                        <Camera size={20} />
                        <span className='text-sm'>Camera</span>
                    </button>
                </div>

                <button
                    onClick={handleSend}
                    className='flex gap-2 bg-tertiary hover:bg-quaternary rounded-full p-2 cursor-pointer transition-all duration-300'
                    aria-label='Send message'
                >
                    <Send size={20} />
                    <span className='text-sm'>Send</span>
                </button>
            </div>
        </div>
    )
}