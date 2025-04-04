import { createSlice } from '@reduxjs/toolkit'

const initialState = ''

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotification(state, action) {
      return action.payload
    },
    clearNotification() {
      return ''
    }
  }
})

export const { setNotification, clearNotification } = notificationSlice.actions

// Action creator for timed notifications
export const setTimedNotification = (message, seconds) => {
  return async dispatch => {
    dispatch(setNotification(message))
    
    setTimeout(() => {
      dispatch(clearNotification())
    }, seconds * 1000)
  }
}

export default notificationSlice.reducer 