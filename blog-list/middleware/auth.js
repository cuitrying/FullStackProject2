const jwt = require('jsonwebtoken')
const User = require('../models/user')

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  } else {
    request.token = null
  }
  next()
}

const userExtractor = async (request, response, next) => {
  if (!request.token) {
    request.user = null
    return next()
  }

  try {
    const decodedToken = jwt.verify(request.token, process.env.JWT_SECRET)
    if (!decodedToken.id) {
      request.user = null
      return next()
    }

    request.user = await User.findById(decodedToken.id)
    next()
  } catch (error) {
    request.user = null
    next()
  }
}

module.exports = { tokenExtractor, userExtractor } 