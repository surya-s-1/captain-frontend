import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Message {
    msg_id: string,
    text: string,
    files: string[],
    timestamp: string,
    role: string
}

interface ChatState {
    messages: Message[]
}

const initialState: ChatState = {
    messages: []
}

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        clearMessages: (state: ChatState) => {
            state.messages = []
        },
        pushMessage: (state: ChatState, action: PayloadAction<Message>) => {
            const idx = state.messages.findIndex(m => m.msg_id === action.payload.msg_id)

            if (idx !== -1) {
                state.messages[idx] = action.payload
            } else {
                state.messages.push(action.payload)
            }
            
            state.messages.sort((a, b) => (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()))
        },
        updateMessage: (state: ChatState, action: PayloadAction<{ msg_id: string, text: string }>) => {
            const msg = state.messages.find(m => m.msg_id === action.payload.msg_id)
            if (msg) {
                msg.text = action.payload.text
            }
        }
    }
})

export const {
    clearMessages,
    pushMessage,
    updateMessage
} = chatSlice.actions

export default chatSlice.reducer