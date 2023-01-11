import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { SET_BIRTH, ALL_AUTHORS } from '../queries'

const EditAuthor = ({ authors, show, setErr }) => {
  const [name, setName] = useState(authors[0].name)
  const [born, setBorn] = useState('')

  const [ setBirth ] = useMutation(SET_BIRTH, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      console.log(error.message)
      setErr(error.message + ": Birthyear must be numbers only")
      setTimeout(() => {
        setErr(null)
      }, 5000)
    }
  })

  const submit = async (event) => {
    event.preventDefault()
    setBirth({ variables: { name, born } })
    setBorn('')
  }

  const handleChange = ({ target }) => {
    if (isNaN(target.value)) {
      setBorn(target.value)
    } else {
      setBorn(parseInt(target.value))
    }
  }
  
  if (!show) {
    return null
  }

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>  
        <div>
          name
          <select value={name} onChange={({ target }) => setName(target.value)}>
            {authors.map(a =>
              <option key={a.name} value={a.name}>{a.name}</option>
            )}
          </select>
        </div>
        <div>
          born
          <input
            value={born}
            onChange={handleChange}
          />
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>
  )
}

export default EditAuthor
