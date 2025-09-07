'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '@/lib/store'
import { getCurrentUser } from '@/lib/firebase/utilities'

import Jira_Light_Logo from '@/../public/Jira_Logo_light.png'
import Jira_Dark_Logo from '@/../public/Jira_Logo_dark.png'

const NEXT_PUBLIC_TOOL_ENDPOINT = process.env.NEXT_PUBLIC_TOOL_ENDPOINT || ''

export default function Integrations() {
    const appUser = useSelector((state: RootState) => state.user)

    const [jiraLoading, setJiraLoading] = useState(false)
    const [jiraConnected, setJiraConnected] = useState(false)

    async function checkJiraConnection() {
        setJiraLoading(true)

        const user = await getCurrentUser()
        if (!user) return

        const token = await user.getIdToken()
        if (!token) return

        const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/tools/jira/status`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (response.ok) {
            const result = await response.json()
            setJiraConnected(result.connected)
            setJiraLoading(false)
        } else {
            console.error('Error checking Jira status')
        }
    }

    useEffect(() => {
        checkJiraConnection()
    }, [])

    async function connectJira() {
        const user = await getCurrentUser()

        if (!user) {
            return
        }

        const token = await user.getIdToken()

        if (!token) {
            return
        }

        const response = await fetch(`${NEXT_PUBLIC_TOOL_ENDPOINT}/tools/jira/connect`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (response.ok) {
            const result = await response.json()
            if (result.redirect_url) {
                window.location.href = result.redirect_url
            }
        }
    }

    return (
        <div className='flex flex-col items-start gap-8 p-8 w-full'>
            <h2 className='text-2xl font-bold'>Integrations</h2>
            <div className='flex items-center gap-32'>
                <img 
                    src={appUser.theme === 'light' ? Jira_Light_Logo.src : Jira_Dark_Logo.src} 
                    alt='Jira Logo' 
                    className='h-20' 
                />
                {
                    jiraConnected ?
                        <div
                            className='flex flex-col gap-2'
                        >
                            <span
                                className='text-success'
                            >
                                Connected
                            </span>
                            <button
                                className='text-link font-sans font-semibold cursor-pointer'
                                onClick={() => connectJira()}
                            >
                                Having issues? Reconnect
                            </button>
                        </div>
                    : jiraLoading ? 
                        <span
                            className='text-color-primary'
                        >
                            Geting status...
                        </span>
                    : <button
                        className='text-link font-sans font-semibold cursor-pointer'
                        onClick={() => connectJira()}
                    >
                        Connect
                    </button>
                }
            </div>
        </div>
    )
}
