const jwt = require('jsonwebtoken')

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7) // Extract token
  }
  next()
}

const userExtractor = async (request, response, next) => {
  const token = request.token
  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
      request.user = decodedToken // Attach user info to request
    } catch (error) {
      return response.status(401).json({ error: 'Token invalid or expired' })
    }
  }
  next()
}

module.exports = { tokenExtractor, userExtractor } 