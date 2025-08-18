import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type Mode = 'light' | 'dark'

interface UserState {
    uid: string | null
    name: string | null
    email: string | null
    loading: boolean
    mode: Mode
}

const initialState: UserState = {
    uid: null,
    name: 'User',
    email: null,
    loading: true,
    mode: 'light'
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ uid: string; name: string; email: string }>) => {
            state.uid = action.payload.uid
            state.name = action.payload.name
            state.email = action.payload.email
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
        toggleMode: (state, action: PayloadAction<Mode>) => {
            state.mode = action.payload
        }
    }
})

export const {
    setUser,
    clearUser,
    setLoading,
    toggleMode
} = userSlice.actions

export default userSlice.reducer