'use strict'

const handlers = require('../handlers')
const config = require('../config')

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: handlers.front,
    config: {
      description: 'front',
      notes: 'login',
      tags: ['api']
    }
  },
  {
    method: 'GET',
    path: '/ping',
    handler: handlers.ping,
    config: {
      description: 'ping',
      notes: 'login',
      tags: ['api']
    }
  },
  {
    method: 'GET',
    path: `${config.route.login}/{site?}`,
    handler: handlers.login,
    config: {
      description: 'login',
      notes: 'login',
      tags: ['api']
    }
  },
  {
    method: 'GET',
    path: config.route.logoutResponse,
    handler: handlers.logoutResponse,
    config: {
      description: 'login',
      notes: 'login',
      tags: ['api']
    }
  },
  {
    method: 'POST',
    path: config.route.loginResponse,
    handler: handlers.assert,
    config: {
      description: 'assert',
      notes: 'assert',
      tags: ['api']
    }
  },
  {
    method: 'GET',
    path: config.route.logout,
    handler: handlers.logout,
    config: {
      description: 'logout',
      notes: 'logout',
      tags: ['api']
    }
  }
]
