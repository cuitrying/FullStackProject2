import { createSlice } from '@reduxjs/toolkit'

const initialState = ''

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotification(state, action) {
      console.log('Setting notification:', action.payload)
      return action.payload
    },
    clearNotification() {
      console.log('Clearing notification')
      return ''
    }
  }
})

export const { setNotification, clearNotification } = notificationSlice.actions

// Keep track of the timeout ID to clear previous timeouts
let timeoutId = null

// Action creator for timed notifications
export const setTimedNotification = (message, seconds) => {
  return async dispatch => {
    console.log('Setting timed notification:', message, 'for', seconds, 'seconds')
    
    // Clear any existing timeout to prevent race conditions
    if (timeoutId) {
      clearTimeout(timeoutId)
      console.log('Cleared previous timeout')
    }
    
    dispatch(setNotification(message))
    
    timeoutId = setTimeout(() => {
      dispatch(clearNotification())
      timeoutId = null
    }, seconds * 1000)
  }
}

export default notificationSlice.reducer 