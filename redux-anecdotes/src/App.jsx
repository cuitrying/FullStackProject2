import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import AnecdoteForm from './components/AnecdoteForm'
import AnecdoteList from './components/AnecdoteList'
import Filter from './components/Filter'
import Notification from './components/Notification'
import { initializeAnecdotes } from './reducers/anecdoteReducer'
import { setTimedNotification } from './reducers/notificationReducer'

const App = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    console.log('Fetching anecdotes...')
    setLoading(true)
    
    dispatch(initializeAnecdotes())
      .then(() => {
        console.log('Anecdotes fetched successfully')
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching anecdotes:', error)
        dispatch(setTimedNotification('Error loading anecdotes. Is the server running?', 5))
        setLoading(false)
      })
  }, [dispatch])
  
  return (
    <div>
      <h2>Anecdotes</h2>
      <Notification />
      <Filter />
      {loading ? <div>Loading anecdotes...</div> : <AnecdoteList />}
      <AnecdoteForm />
    </div>
  )
}

export default App