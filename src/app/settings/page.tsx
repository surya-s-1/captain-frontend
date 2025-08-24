'use client'

import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { UserRound } from 'lucide-react'

import { auth } from '@/lib/firebase'
import { RootState } from '@/lib/store'
import { toggleTheme, Theme } from '@/lib/slices/user'
import { clearMessages } from '@/lib/slices/chat'

const MODEL_ENDPOINT = process.env.NEXT_PUBLIC_MODEL_ENDPOINT

export default function Settings() {
    const dispatch = useDispatch()
    const appUser = useSelector((state: RootState) => state.user)
    const [message, setMessage] = useState('')

    async function deleteChat() {
        const user = auth.currentUser
        if (!user) return

        const token = await user.getIdToken()
        if (!token) return

        const response = await fetch(`${MODEL_ENDPOINT}/delete-chat`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (response.ok) {
            setMessage('Chat history deleted successfully')
            dispatch(clearMessages())
        } else {
            setMessage('Failed to delete chat history')
        }
    }

    return (
        <div className='w-full h-full flex flex-col pl-4 lg:pl-40 mt-8 gap-4 lg:gap-8'>
            {appUser?.photoURL ?
                <img src={appUser.photoURL} className='rounded-full w-20' /> :
                <UserRound className='text-color-secondary bg-secondary rounded-full' size={72} />
            }
            <div className='flex items-center gap-8 text-xl'>
                <span>Name</span>
                <span>{appUser.name}</span>
            </div>
            <div className='flex items-center gap-8 text-xl'>
                <span>Email</span>
                <span>{appUser.email}</span>
            </div>
            <div className='flex items-center gap-8 text-xl'>
                <span>Theme</span>
                <select
                    className='bg-secondary text-color-secondary rounded-md border border-gray-500 outline-0 p-1'
                    value={appUser.theme}
                    onChange={e => dispatch(toggleTheme(e.target.value as Theme))}
                >
                    <option value='light'>Light</option>
                    <option value='dark'>Dark</option>
                </select>
            </div>
            <div className='flex flex-col gap-8 text-xl'>
                <button 
                    className='bg-red-400 text-white rounded-md p-2 w-fit cursor-pointer'
                    onClick={() => { deleteChat() }}
                >
                    Delete Chat
                </button>
                <p>{message}</p>
            </div>
        </div>
    )
}