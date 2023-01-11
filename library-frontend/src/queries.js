import { gql } from '@apollo/client'

export const RECOMMENDATIONS = gql`
  query recommendations($favoriteGenre: String!){
    allBooks(genre: $favoriteGenre) {
      title
      author {
        name
        born
        bookCount
      }
      published
      genres
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export const USER = gql`
  query {
    me {
      favoriteGenre
    }
  }
`

export const ALL_AUTHORS = gql`
  query {
    allAuthors  {
      name
      born
      bookCount
    }
  }
`

export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author {
        name
        born
        bookCount
      }
      published
      genres
    }
  }
`

export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(
      title: $title,
      author: $author,
      published: $published,
      genres: $genres
    ) {
      title
      author {
        name
      }
      published
      genres
    }
  }
`
export const SET_BIRTH = gql`
  mutation setBirth($name: String!, $born: Int!) {
    editAuthor(
      name: $name
      setBornTo: $born
    ) {
      name
      born
      bookCount
      }
  }
`
