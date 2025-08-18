'use client'

import { onAuthStateChanged, User } from 'firebase/auth'

import { auth } from '@/lib/firebase'
import { store } from '@/lib/store'
import { setUser, clearUser, setLoading } from '@/lib/slices/user'

export function listenToAuthChanges() {
    onAuthStateChanged(auth, async (user: User | null) => {
        if (user) {
            const token = await user.getIdToken() // short-lived (~1h)
            const refreshToken = user.refreshToken // long-lived

            store.dispatch(
                setUser({
                    uid: user.uid,
                    name: user.displayName || 'Anonymous',
                    email: user.email || ''
                })
            )

            const idTokenResult = await user.getIdTokenResult()
            const expiryTime = new Date(idTokenResult.expirationTime).getTime()
            const now = Date.now()
            const timeout = expiryTime - now - 5 * 60 * 1000

            if (timeout > 0) {
                setTimeout(async () => {
                    await getFreshIdToken(true)
                }, timeout)
            }

        } else {
            store.dispatch(clearUser())
        }

        store.dispatch(setLoading(false))
    })
}

export async function getFreshIdToken(force = false): Promise<string | null> {
    const user = auth.currentUser
    if (!user) return null

    try {
        const token = await user.getIdToken(force)
        return token
    } catch (err) {
        console.error('Error refreshing ID token:', err)
        return null
    }
}