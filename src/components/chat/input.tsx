'use client'

import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { Paperclip, Camera, Send, X as Remove } from 'lucide-react'
import Webcam from 'react-webcam'

import { pushMessage, updateMessage } from '@/lib/slices/chat'
import { getCurrentUser } from '@/lib/firebase/utilities'

const MODEL_ENDPOINT = process.env.NEXT_PUBLIC_MODEL_ENDPOINT

export default function ChatInput({ setAutoScroll }) {
    const [inputValue, setInputValue] = useState('')
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [capturedFiles, setCapturedFiles] = useState<File[]>([])
    // const [isCameraOpen, setIsCameraOpen] = useState(false)
    // const [isRecording, setIsRecording] = useState(false)
    // const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    // const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    // const captureInputRef = useRef<HTMLInputElement>(null)
    // const webcamRef = useRef<Webcam>(null)
    const dispatch = useDispatch()

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
            const maxSize = 30 * 1024 * 1024
            const validFiles = files.filter(file => file.size <= maxSize)

            if (validFiles.length < files.length) {
                alert('Some files were not uploaded due to type/size restrictions.')
            }

            setUploadedFiles(prev => [...prev, ...validFiles])
            if (fileInputRef.current) fileInputRef.current.value = ''
        } else {
            if (fileInputRef.current) fileInputRef.current.click()
        }
    }
    /*
    const handleCaptureMobile = () => {
        if (captureInputRef.current) {
            captureInputRef.current.value = ''
            captureInputRef.current.click()
        }
    }

    const handleCaptureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            const maxSize = 30 * 1024 * 1024
            const validFiles = files.filter(file => file.size <= maxSize)
            if (validFiles.length < files.length) {
                alert('Some captured files were not loaded due to size restrictions.')
            }
            setCapturedFiles(prev => [...prev, ...validFiles])
        }
    }

    const handleOpenCameraDesktop = () => {
        setIsCameraOpen(true)
    }

    const handleCapturePhoto = () => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (imageSrc) {
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `photo-${Date.now()}.png`, { type: 'image/png' })
                    setCapturedFiles(prev => [...prev, file])
                })
        }
    }

    const handleStartRecording = () => {
        if (webcamRef.current && webcamRef.current.stream) {
            const recorder = new MediaRecorder(webcamRef.current.stream, {
                mimeType: 'video/webm'
            })

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    setRecordedChunks(prev => [...prev, event.data])
                }
            }

            recorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' })
                const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' })
                setCapturedFiles(prev => [...prev, file])
                setRecordedChunks([]) reset
            }

            recorder.start()
            setMediaRecorder(recorder)
            setIsRecording(true)
        }
    }

    const handleStopRecording = () => {
        mediaRecorder?.stop()
        setIsRecording(false)
    }

    const handleCloseCamera = () => {
        setIsCameraOpen(false)
        setIsRecording(false)
        setRecordedChunks([])
        mediaRecorder?.stop()
    }
    */

    const handleRemoveFile = (file) => {
        setUploadedFiles(prev => prev.filter(f => f !== file))
        setCapturedFiles(prev => prev.filter(f => f !== file))
    }

    const handleSend = async () => {
        if (loading) return

        const allFiles = [...uploadedFiles, ...capturedFiles]

        if (inputValue.trim() !== '' || allFiles.length > 0) {
            setLoading(true)
            setAutoScroll(true)

            const user = await getCurrentUser()
            const token = await user.getIdToken()
            
            const formData = new FormData()

            formData.append('text', inputValue)

            for (const file of allFiles) {
                formData.append('files', file)
            }

            const newMsgRes = await fetch(`${MODEL_ENDPOINT}/new-message`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!newMsgRes.ok) {
                alert('Failed to send message.')
                setLoading(false)
                return
            }

            const msg_id = await newMsgRes.text()

            const newMsg = {
                msg_id,
                text: inputValue,
                files: allFiles.map(f => f.name),
                timestamp: new Date().toISOString(),
                role: 'user'
            }

            dispatch(pushMessage(newMsg))
            setInputValue('')
            setUploadedFiles([])
            setCapturedFiles([])

            const modelMsgId = msg_id + '-model'
            const modelMsg = {
                msg_id: modelMsgId,
                text: '',
                files: [],
                timestamp: new Date().toISOString(),
                role: 'model'
            }

            dispatch(pushMessage(modelMsg))

            await getStreamingResponse('', modelMsgId)
        }
    }

    async function getStreamingResponse(chat_id: string, modelMsgId: string) {
        const user = await getCurrentUser()
        const token = await user.getIdToken()

        const response = await fetch(`${MODEL_ENDPOINT}/streaming-response`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/plain',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ chat_id: chat_id || '' })
        })

        const decoder = new TextDecoder()
        let fullText = ''

        if (response.body) {
            const reader = response.body.getReader()
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const textChunk = decoder.decode(value, { stream: true })

                const chunks = textChunk.split(' ')

                for (let chunk of chunks) {
                    fullText += `${chunk} `
                    dispatch(updateMessage({ msg_id: modelMsgId, text: fullText }))
                    await new Promise(resolve => setTimeout(resolve, 50))
                }
            }
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
        <div className='sticky bottom-0 z-10 w-full h-fit p-4 bg-secondary rounded-2xl'>
            <textarea
                className='w-full p-0 mb-2 outline-0 resize-none overflow-y-auto scrollbar'
                autoFocus
                ref={textareaRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder='Ask Sage'
                rows={1}
            />

            {uploadedFiles.length > 0 &&
                <div className='flex flex-wrap gap-2 mb-2'>
                    {uploadedFiles.map((file, idx) => (
                        <span key={idx} className='flex items-center gap-1 py-0.5 px-2 border rounded-full text-xs'>
                            <Paperclip size={12} />
                            {file.name}
                            <Remove size={12} className='text-red-500 cursor-pointer' onClick={() => handleRemoveFile(file)} />
                        </span>
                    ))}
                </div>}

            {capturedFiles.length > 0 &&
                <div className='flex flex-wrap gap-2 mb-2'>
                    {capturedFiles.map((file, idx) => (
                        <span key={idx} className='flex items-center gap-1 py-0.5 px-2 border rounded-full text-xs'>
                            <Camera size={12} />
                            {file.name}
                            <Remove size={12} className='text-red-500 cursor-pointer' onClick={() => handleRemoveFile(file)} />
                        </span>
                    ))}
                </div>}

            {/* {isCameraOpen && (
                <div className='mb-2'>
                    <Webcam
                        ref={webcamRef}
                        screenshotFormat='image/png'
                        className='rounded-lg w-64'
                        videoConstraints={{ facingMode: 'user' }}
                    />
                    <div className='flex gap-2 mt-2'>
                        <button
                            onClick={handleCapturePhoto}
                            className='px-3 py-1 bg-green-500 text-white rounded-lg'
                            type='button'
                        >
                            Capture Photo
                        </button>

                        {!isRecording ? (
                            <button
                                onClick={handleStartRecording}
                                className='px-3 py-1 bg-blue-500 text-white rounded-lg'
                                type='button'
                            >
                                Start Video
                            </button>
                        ) : (
                            <button
                                onClick={handleStopRecording}
                                className='px-3 py-1 bg-red-500 text-white rounded-lg'
                                type='button'
                            >
                                Stop Video
                            </button>
                        )}

                        <button
                            onClick={handleCloseCamera}
                            className='px-3 py-1 bg-gray-500 text-white rounded-lg'
                            type='button'
                        >
                            Close
                        </button>
                    </div>
                </div>
            )} */}

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
                    {/* <input
                        className='hidden'
                        type='file'
                        ref={captureInputRef}
                        accept='image/*,video/*'
                        capture='environment'
                        multiple
                        onChange={handleCaptureChange}
                    /> */}

                    <button
                        onClick={() => handleFileUpload()}
                        className='flex gap-2 bg-tertiary hover:bg-quaternary rounded-full p-2 cursor-pointer transition-all duration-200'
                        aria-label='Upload file'
                        type='button'
                    >
                        <Paperclip size={20} />
                        <span className='text-sm'>Upload</span>
                    </button>

                    {/* <button
                        onClick={() => {
                            if (/Mobi|Android/i.test(navigator.userAgent)) {
                                handleCaptureMobile()
                            } else {
                                handleOpenCameraDesktop()
                            }
                        }}
                        className='flex gap-2 bg-tertiary hover:bg-quaternary rounded-full p-2 cursor-pointer transition-all duration-200'
                        aria-label='Capture image or video'
                        type='button'
                    >
                        <Camera size={20} />
                        <span className='text-sm'>Camera</span>
                    </button> */}
                </div>

                {!loading &&
                <button
                    onClick={handleSend}
                    className={`flex gap-2 bg-tertiary hover:bg-quaternary rounded-full p-2 cursor-pointer transition-all duration-300`}
                    aria-label='Send message'
                    type='button'
                >
                    <Send size={20} />
                    <span className='text-sm'>Send</span>
                </button>}
            </div>
        </div>
    )
}