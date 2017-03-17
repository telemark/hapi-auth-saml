'use strict'

const config = require('../config')
const jwt = require('jsonwebtoken')
const encryptor = require('simple-encryptor')(config.SAML_JWT_SECRET)

exports.front = (request, reply) => {
  const message = {
    message: 'Hello lovely human! Look at docs at https://github.com/telemark/hapi-auth-saml'
  }
  reply(message)
}

exports.ping = (request, reply) => {
  const message = { ping: 'pong' }
  reply(message)
}

exports.logoutResponse = (request, reply) => {
  reply.redirect(config.route.logoutRedir)
}

exports.login = (request, reply) => {
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

exports.assert = (request, reply) => {
  const saml = request.server.plugins['hapi-passport-saml'].instance

  if (request.payload.SAMLRequest) {
    // Implement your SAMLRequest handling here
    reply('Something failed').code(500)
  }
  if (request.payload.SAMLResponse) {
    // Handles SP use cases, e.g. IdP is external and SP is Hapi
    saml.validatePostResponse(request.payload, (err, profile) => {
      if (err) {
        request.log(['err'], err)
        reply('Something failed').code(500)
      }

      // Data recived from idporten
      const dataObj = {
        email: profile.Email,
        mobilePhone: profile.MobilePhone,
        uid: profile.uid,
        logoutUrl: `${config.route.defaultUrl}${config.route.logout}`
      }

      request.log(['debug'], dataObj)

      // Save profile for logout in yar
      profile.logoutUrl = `${config.route.defaultUrl}${config.route.logout}`
      request.yar.set('profile', profile)

      const encObj = encryptor.encrypt(dataObj)
      const token = jwt.sign({data: encObj}, config.SAML_JWT_SECRET, config.jwtTokenOptions)
      const redirUrl = `${config.route.loginRedir}/?jwt=${token}`
      reply.redirect(redirUrl)
    })
  }
}

exports.logout = (request, reply) => {
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
