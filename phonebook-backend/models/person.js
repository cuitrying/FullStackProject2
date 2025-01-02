const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minLength: [3, 'Name must be at least 3 characters long'],
    unique: true
  },
  number: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^(\d{2,3})-(\d{4,})$/.test(v) && v.length >= 8
      },
      message: props => 
        `${props.value} is not a valid phone number!\n` +
        'Phone number must:\n' +
        '- Be at least 8 characters long\n' +
        '- Be in format: XX-XXXX... or XXX-XXXX...\n' +
        '- Have 2-3 digits before the hyphen\n' +
        '- Have at least 4 digits after the hyphen'
    }
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema) 