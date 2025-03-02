require('dotenv').config()

const PORT = process.env.PORT || 3003
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/bloglist'
const JWT_SECRET = process.env.JWT_SECRET

module.exports = {
  MONGODB_URI,
  PORT,
  JWT_SECRET,
} 