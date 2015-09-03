var model = require('nodejs-model');

var Profile = model("Profile").attr('id', {
  validations: {
    presence: {
      message: 'Id is required!'
    }
  }
}).attr('name', {
  validations: {
    presence: {
      message: 'Name is required!'
    }
  }
}).attr('email', {
  validations: {
    presence: {
      message: 'Email is required!'
    },
    format: {
      with: /^[^@]+@[^@]+\.[^@]+$/,
      allowBlank: false,
      message: 'Invalid email address.'
    }
  },
  tags: ['private']
}).attr('avatarUrl');

module.exports = Profile;