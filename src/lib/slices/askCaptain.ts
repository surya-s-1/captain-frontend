import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Message {
    msg_id: string
    text: string
    timestamp: string
    role: string
    session_id: string
}

interface askCaptainState {
    messages: Message[]
}

const initialState: askCaptainState = {
    messages: []
}

export const askCaptainSlice = createSlice({
    name: 'askCaptain',
    initialState,
    reducers: {
        clearMessages: (state: askCaptainState) => {
            state.messages = []
        },
        pushMessage: (state: askCaptainState, action: PayloadAction<Message>) => {
            const idx = state.messages.findIndex(m => m.msg_id === action.payload.msg_id)

            if (idx !== -1) {
                state.messages[idx] = action.payload
            } else {
                state.messages.push(action.payload)
            }
            
            state.messages.sort((a, b) => (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()))
        },
        updateMessage: (state: askCaptainState, action: PayloadAction<{ msg_id: string, text: string }>) => {
            const msg = state.messages.find(m => m.msg_id === action.payload.msg_id)
            if (msg) {
                msg.text = action.payload.text.trim()
            }
        }
    }
})

export const {
    clearMessages,
    pushMessage,
    updateMessage
} = askCaptainSlice.actions

export default askCaptainSlice.reducer