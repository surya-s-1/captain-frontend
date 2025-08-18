'use client'

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { UserRound } from 'lucide-react'

import { RootState } from '@/lib/store'
import { toggleTheme, Theme } from '@/lib/slices/user'

export default function Settings() {
    const appUser = useSelector((state: RootState) => state.user)
    const dispatch = useDispatch()

    return (
        <div className='w-full h-full flex flex-col pl-40 mt-8 gap-8'>
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
        </div>
    )
}