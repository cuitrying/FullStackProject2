import { createSlice } from '@reduxjs/toolkit'
import anecdoteService from '../services/anecdotes'

const anecdoteSlice = createSlice({
  name: 'anecdotes',
  initialState: [],
  reducers: {
    updateAnecdote(state, action) {
      const updatedAnecdote = action.payload
      return state.map(anecdote => 
        anecdote.id !== updatedAnecdote.id ? anecdote : updatedAnecdote
      )
    },
    appendAnecdote(state, action) {
      state.push(action.payload)
    },
    setAnecdotes(state, action) {
      return action.payload
    }
  }
})

export const { updateAnecdote, appendAnecdote, setAnecdotes } = anecdoteSlice.actions

export const initializeAnecdotes = () => {
  return async dispatch => {
    try {
      console.log('Calling anecdoteService.getAll()...')
      const anecdotes = await anecdoteService.getAll()
      console.log('Received anecdotes:', anecdotes)
      dispatch(setAnecdotes(anecdotes))
      return Promise.resolve()
    } catch (error) {
      console.error('Error in initializeAnecdotes:', error)
      return Promise.reject(error)
    }
  }
}

export const createAnecdote = (content) => {
  return async dispatch => {
    try {
      const newAnecdote = await anecdoteService.createNew(content)
      dispatch(appendAnecdote(newAnecdote))
      return newAnecdote
    } catch (error) {
      console.error('Error creating anecdote:', error)
      throw error
    }
  }
}

export const voteAnecdote = (id) => {
  return async (dispatch, getState) => {
    try {
      const anecdotes = getState().anecdotes
      const anecdoteToChange = anecdotes.find(a => a.id === id)
      const changedAnecdote = { 
        ...anecdoteToChange, 
        votes: anecdoteToChange.votes + 1 
      }
      
      const updatedAnecdote = await anecdoteService.update(id, changedAnecdote)
      dispatch(updateAnecdote(updatedAnecdote))
    } catch (error) {
      console.error('Error voting for anecdote:', error)
    }
  }
}

export default anecdoteSlice.reducer