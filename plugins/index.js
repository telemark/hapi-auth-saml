'use strict'

const saml = require('hapi-passport-saml')
const good = require('good')
const yar = require('yar')
const config = require('../config')

const goodOptions = {
  ops: {
    interval: 900000
  },
  reporters: {
    console: [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [
          {
            log: '*',
            ops: '*',
            error: '*',
            request: '*',
            response: '*'
          }
        ]
      },
      {
        module: 'good-console'
      },
      'stdout'
    ]
  }
}

const yarOptions = {
  storeBlank: false,
  cookieOptions: {
    password: config.YAR_SECRET,
    isSecure: process.env.NODE_ENV !== 'development',
    isSameSite: 'Lax'
  }
}

module.exports = [
  {
    register: good,
    options: goodOptions
  },
  {
    register: saml,
    options: config.passport
  },
  {
    register: yar,
    options: yarOptions
  }
]
