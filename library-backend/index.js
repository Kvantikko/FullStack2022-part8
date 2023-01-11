const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const JWT_SECRET = 'SECRET_KEY'

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

// GraphQL-skeemat
const typeDefs = gql`
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }
`

// miten GraphQL-kyselyihin vastataan
const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      // jos annettu molemmat parametrit
      if (args.author && args.genre) {
        const author = await Author.findOne({ name: args.author })
        
        if (!author) {
          return []
        }
        
        let books = await Book.find({ author: author.id }).populate('author')
        books = books.filter(b => b.genres.includes(args.genre))
        
        return books
      }

      // jos annettu author parametri
      if (args.author) {
        const author = await Author.findOne({ name: args.author})
        
        if (!author) {
          return []
        }

        return await Book.find({ author: author.id }).populate('author')
      }

      // jos annettu genre parametri
      if (args.genre) {
        return Book.find({ genres: args.genre }).populate('author')
      }

      // jos ei annettu parametreja
      return Book.find({}).populate('author')
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser
    }
  },

  Author: {
    name: (root) => root.name,
    born: (root) => root.born ? root.born : null,
    bookCount: async (root) => {
      const books = await Book.find({ author: root.id })
      return books.length
    },
    id: (root) => root.id
  },

  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      console.log(currentUser)
     
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      let author = await Author.findOne({ name: args.author}) 
      
      if (!author) {
        author = new Author({ name: args.author })
        try {
          await author.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }

      const book = new Book({
        ...args, author: author.id 
      })

      try {
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      } 

      return Book.findOne({ _id: book.id }).populate('author')
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      
      let author = await Author.findOne({ name: args.name })
      
      if (!author) {
        throw new UserInputError('The name provided did not match any authors', {
          invalidArgs: args,
        })
      }

      try {
        author.born = args.setBornTo 
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return author
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
      
      try {
        return await user.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      
      if ( !user || args.password !== 'salainen' ) {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      console.log(userForToken, JWT_SECRET)

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User
        .findById(decodedToken.id)  
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})