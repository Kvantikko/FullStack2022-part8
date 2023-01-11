import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { CREATE_BOOK, ALL_AUTHORS, ALL_BOOKS, RECOMMENDATIONS } from '../queries'

const NewBook = ({ show, user, setError }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [ createBook ] = useMutation(CREATE_BOOK, {
    refetchQueries: [ { 
      query: ALL_BOOKS }, { 
      query: ALL_AUTHORS }, {
      query: RECOMMENDATIONS, variables: { favoriteGenre: user.favoriteGenre }
    } ],
    onError: (error) => {
      console.log(error.message)
      setError(error.message)
      setTimeout(() => {
        setError(null)
      }, 5000)
    }
    /*
    onError: ({ graphQLErrors, networkError }) => {
      //console.log("error happened")
      let message = ''
      if (graphQLErrors) {
        //console.log("graphQLErrors")
        //console.log(graphQLErrors)
        
      }
      if (networkError) {
        console.log(networkError.result.errors[0].message)
        message = networkError.result.errors[0].message
      }
      setError(message)
      setTimeout(() => {
        setError(null)
      }, 5000)
    }
    */
  })

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    createBook({ variables: { title, author, published, genres } })
    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type='number'
            value={published}
            onChange={({ target }) => setPublished(parseInt(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">add genre</button>
        </div>
        <div>
          genres: {genres.join(' ')}
        </div>
        <button type='submit'>create book</button>
      </form>
    </div>
  )
}

export default NewBook
