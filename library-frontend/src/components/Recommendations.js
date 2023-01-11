import { React, useEffect, useState } from 'react'

import { useLazyQuery } from '@apollo/client'
import { RECOMMENDATIONS } from '../queries'

const Recommendations = ({ show, user }) => {
  const [ books, setBooks ] = useState([])
  const [getBooks, result] = useLazyQuery(RECOMMENDATIONS)
  
  useEffect(() => {
    getBooks({ variables: { favoriteGenre: user.favoriteGenre } })
    if (result.data) {
      setBooks(result.data.allBooks)
    }
  }, [getBooks, user.favoriteGenre, result.data])
  
  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }
 
  return (
    <div>
      <h2>recommendations</h2>
      <div>books in your favorite genre <b>{user.favoriteGenre}</b></div>

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
            {books.map(b =>
              <tr key={b.title}>
                <td>{b.title}</td>
                <td>{b.author.name}</td>
                <td>{b.published}</td>
              </tr>
            )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations