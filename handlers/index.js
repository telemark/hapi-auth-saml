'use strict'

const config = require('../config')
const saveSession = require('../lib/save-session')
const generateJwt = require('../lib/generate-jwt')

module.exports.front = (request, reply) => {
  const message = {
    message: 'Hello lovely human! Look at docs at https://github.com/telemark/hapi-auth-saml'
  }
  reply(message)
}

module.exports.ping = (request, reply) => {
  const message = { ping: 'pong' }
  reply(message)
}

module.exports.logoutResponse = (request, reply) => {
  reply.redirect(config.route.logoutRedir)
}

module.exports.login = (request, reply) => {
  const saml = request.server.plugins['hapi-passport-saml'].instance

  saml.getAuthorizeUrl({
    headers: request.headers,
    body: request.payload,
    query: request.query
  }, (err, loginUrl) => {
    if (err) {
      request.log(['err'], err)
      reply('Something failed').code(500)
    } else {
      reply.redirect(loginUrl)
    }
  })
}

module.exports.assert = (request, reply) => {
  const saml = request.server.plugins['hapi-passport-saml'].instance

  if (request.payload.SAMLRequest) {
    // Implement your SAMLRequest handling here
    request.log(['err'], 'SAMLRequest failed')
    reply('Something failed').code(500)
  }
  if (request.payload.SAMLResponse) {
    // Handles SP use cases, e.g. IdP is external and SP is Hapi
    saml.validatePostResponse(request.payload, async (err, profile) => {
      if (err) {
        request.log(['err'], err)
        reply('Something failed').code(500)
      } else {
        // Data recived from IdP

        request.log(['debug'], profile)

        // Save session to temp storage
        const session = await saveSession(profile)

        // Generates and encrypts jwt with data from IdP
        const jwt = generateJwt(Object.assign({sessionKey: session}, profile))

        // Save profile for logout in yar
        request.yar.set('profile', profile)

        // Redirects to application with encrypted jwt
        const redirUrl = `${config.route.loginRedir}/?jwt=${jwt}`
        reply.redirect(redirUrl)
      }
    })
  }
}

module.exports.logout = (request, reply) => {
  const saml = request.server.plugins['hapi-passport-saml'].instance
  request.user = request.yar.get('profile')

  // if no yar session exist, its not possible to log out the user
  if (!request.user) {
    request.log(['debug'], 'User not logged in trying to log out')
    reply('Not logged in').code(500)
  } else {
    saml.getLogoutUrl(request, (err, url) => {
      if (err) {
        request.log(['err'], err)
        reply('Something failed').code(500)
      } else {
        request.log(['debug'], 'User logged out')
        request.yar.clear('profile')
        request.yar.reset()
        reply.redirect(url)
      }
    })
  }
}
