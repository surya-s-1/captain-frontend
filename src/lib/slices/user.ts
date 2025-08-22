import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Theme = 'light' | 'dark'

interface UserState {
    uid: string | null
    name: string | null
    email: string | null
    photoURL: string | null
    loading: boolean
    theme: Theme
}

const initialState: UserState = {
    uid: null,
    name: 'User',
    email: null,
    photoURL: null,
    loading: true,
    theme: 'light'
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ uid: string; name: string; email: string, photoURL: string | null }>) => {
            state.uid = action.payload.uid
            state.name = action.payload.name
            state.email = action.payload.email
            state.photoURL = action.payload.photoURL
            state.loading = false
        },
        clearUser: (state) => {
            state.uid = null
            state.name = null
            state.email = null
            state.loading = false
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        toggleTheme: (state, action: PayloadAction<Theme>) => {
            state.theme = action.payload
        }
    }
})

export const {
    setUser,
    clearUser,
    setLoading,
    toggleTheme
} = userSlice.actions

export default userSlice.reducer