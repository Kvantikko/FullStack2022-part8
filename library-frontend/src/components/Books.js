import { React, useState } from 'react'

const Books = ({ show, books }) => {
  const [genre, setGenre] = useState('all')
  
  if (!show) {
    return null
  }

  const genres = books.reduce((allGenres, book) => {
    const newGenres = book.genres.filter(g => !allGenres.includes(g) && !(g === ''))
    return allGenres.concat(newGenres)
  }, books[0].genres)
  
  const renderGenreButtons = () => {
    return(
      genres.map(g =>
        <button key={g} onClick={() => setGenre(g)}>{g}</button>
      )
    )
  }

  const filterBooks = () => {
    if (genre === 'all') {
      return(
        books.map(b =>
          <tr key={b.title}>
            <td>{b.title}</td>
            <td>{b.author.name}</td>
            <td>{b.published}</td>
          </tr>
        )
      )
    }
    const filteredBooks = books.filter(b => b.genres.includes(genre))
    return(
      filteredBooks.map(b =>
        <tr key={b.title}>
          <td>{b.title}</td>
          <td>{b.author.name}</td>
          <td>{b.published}</td>
        </tr>
      )
    )
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {filterBooks()}
        </tbody>
      </table>

      <div>
        {renderGenreButtons()}
        <button onClick={() => setGenre('all')}>all genres</button>
      </div>
    </div>
  )
}

export default Books