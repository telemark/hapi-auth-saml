'use strict'

const saml = require('hapi-passport-saml')
const yar = require('yar')
const config = require('../config')

const yarOptions = {
  storeBlank: false,
  cookieOptions: {
    password: config.SAML_YAR_SECRET,
    isSecure: process.env.NODE_ENV !== 'development',
    isSameSite: config.SAME_SITE
  }
}

module.exports = [
  {
    register: saml,
    options: config.passport
  },
  {
    register: yar,
    options: yarOptions
  }
]
