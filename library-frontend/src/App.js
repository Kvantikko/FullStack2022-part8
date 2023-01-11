import React, { useState, useEffect } from 'react'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'

import { useQuery, useApolloClient, useLazyQuery } from '@apollo/client'
import { ALL_AUTHORS, ALL_BOOKS, USER } from './queries'


const App = () => {
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [page, setPage] = useState('authors')
  const authorQuery = useQuery(ALL_AUTHORS)
  const bookQuery = useQuery(ALL_BOOKS)
  const client = useApolloClient()
  const [currentUser, userQuery] = useLazyQuery(USER, {
    fetchPolicy: 'network only'
  })

  useEffect(() => {
    const tokenLogged = window.localStorage.getItem('library-user-token')
    if (tokenLogged ) {
      setToken(tokenLogged)
    }
    currentUser()
  }, [currentUser])
  
  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('authors')
  }

  
  const message = () => {
    if (!errorMessage) {
      return null
    }
    return errorMessage
  }

  if (authorQuery.loading || bookQuery.loading)  {
    return <div>loading...</div>
  }

  const renderNav = () => {
    return(
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token === null 
          ?
          <button onClick={() => setPage('login')}>login</button>
          :
          <span>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommendations')}>recommended</button>
            <button onClick={() => logout()}>logout</button>
          </span>
            }
      </div>
    )
  }

  return (
    <div>
      {renderNav()}

      <div>
        {message()}
      </div>
     
      <Authors
        show={page === 'authors'} authors={authorQuery.data.allAuthors} token={token} setError={setErrorMessage}
      />

      <Books
        show={page === 'books'} books={bookQuery.data.allBooks}
      />

      {userQuery.data.me ?
        <NewBook
          show={page === 'add'} user={userQuery.data.me} setError={setErrorMessage}
        />
        : null}
      
      {userQuery.data.me ?
        <Recommendations
          show={page === 'recommendations'} user={userQuery.data.me}
        /> 
        : null}
      
      <LoginForm
        show={page === 'login'} setToken={setToken} setError={setErrorMessage} setPage={setPage} currentUser={currentUser}
      />

    </div>
  )
}

export default App