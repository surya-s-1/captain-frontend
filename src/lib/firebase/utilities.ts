'use client'

import { onAuthStateChanged, User } from 'firebase/auth'

import { auth } from '@/lib/firebase'
import { store } from '@/lib/store'
import { setUser, clearUser, setLoading } from '@/lib/slices/user'

export function listenToAuthChanges() {
    onAuthStateChanged(auth, async (user: User | null) => {
        if (user) {
            // const token = await user.getIdToken() // short-lived (~1h)
            // const refreshToken = user.refreshToken // long-lived

            store.dispatch(
                setUser({
                    uid: user.uid,
                    name: user.displayName || 'Anonymous',
                    email: user.email || '',
                    photoURL: user.photoURL
                })
            )
        } else {
            store.dispatch(clearUser())
        }

        store.dispatch(setLoading(false))
    })
}

export const getCurrentUser = () => new Promise<User | null>(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
        unsubscribe()
        resolve(user)
    })
})