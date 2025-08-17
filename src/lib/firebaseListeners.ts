'use client'

import { onAuthStateChanged, User } from 'firebase/auth'

import { auth } from '@/lib/firebase'
import { store } from '@/lib/store'
import { setUser, clearUser, setLoading } from '@/lib/slices/user'
import { SESSION_STORAGE } from '@/lib/constants'

export function listenToAuthChanges() {
    onAuthStateChanged(auth, async (user: User | null) => {
        if (user) {
            const token = await user.getIdToken() // short-lived (~1h)
            const refreshToken = user.refreshToken // long-lived

            sessionStorage.setItem(SESSION_STORAGE.ID_TOKEN, token)
            sessionStorage.setItem(SESSION_STORAGE.REFRESH_TOKEN, refreshToken)

            store.dispatch(
                setUser({
                    uid: user.uid,
                    name: user.displayName || 'Anonymous',
                    email: user.email || ''
                })
            )
        } else {
            sessionStorage.removeItem(SESSION_STORAGE.ID_TOKEN)
            sessionStorage.removeItem(SESSION_STORAGE.REFRESH_TOKEN)
            store.dispatch(clearUser())
        }
        
        store.dispatch(setLoading(false))
    })
}