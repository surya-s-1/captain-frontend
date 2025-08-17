'use client'

import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { Paperclip, Camera, Send } from 'lucide-react'

export default function ChatInput() {
    const [inputValue, setInputValue] = useState('')
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const textareaRef = useRef(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            const newHeight = Math.min(textareaRef.current.scrollHeight, 150)
            textareaRef.current.style.height = `${newHeight}px`
        }
    }, [inputValue])

    const handleFileUpload = (e?: React.ChangeEvent<HTMLInputElement>) => {
        if (e && e.target.files) {
            const files = Array.from(e.target.files)
            const allowedTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/csv',
                'image/png',
                'image/jpeg',
                'image/jpg',
                'image/webp',
                'video/mp4',
                'video/quicktime',
                'video/x-matroska',
                'video/x-msvideo',
                'video/x-ms-wmv'
            ]
            const maxSize = 30 * 1024 * 1024

            const validFiles = files.filter(file =>
                allowedTypes.includes(file.type) && file.size <= maxSize
            )

            if (validFiles.length < files.length) {
                alert('Some files were not uploaded due to type or size restrictions.')
            }

            setUploadedFiles(prev => [...prev, ...validFiles])

            if (fileInputRef.current) fileInputRef.current.value = ''
        } else {
            if (fileInputRef.current) fileInputRef.current.click()
        }
    }

    const handleCapture = () => {
        console.log('Capture image/video button clicked')
    }

    const handleSend = () => {
        if (inputValue.trim() !== '') {
            console.log('Sending message:', inputValue)
            setInputValue('')
            setUploadedFiles([])
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
            {uploadedFiles.length > 0 && 
            <div className='flex flex-wrap gap-2 mb-2'>
                {uploadedFiles.map((file, idx) => (
                    <span className='flex items-center gap-1 py-0.5 px-2 border rounded-full text-xs' key={idx}>
                        <Paperclip size={12} />
                        {file.name}
                    </span>
                ))}
            </div>}
            <div className='flex justify-between items-center'>
                <div className='flex gap-2'>
                    <input
                        className='hidden'
                        type='file'
                        ref={fileInputRef}
                        multiple
                        accept='.pdf,.doc,.docx,.xls,.xlsx,.csv,image/*,video/*'
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => handleFileUpload()}
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