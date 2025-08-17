import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth'

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
    appId: process.env.NEXT_PUBLIC_FB_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

setPersistence(auth, browserSessionPersistence)
    .then(() => console.log('Firebase persistance set to session storage'))
    .catch((err) => console.error('Error setting persistance:', err))