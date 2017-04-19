'use strict'

const config = require('../config')
const saveSession = require('../lib/save-session')
const generateJwt = require('../lib/generate-jwt')
const logger = require('../lib/logger')

exports.front = (request, reply) => {
  const message = {
    message: 'Hello lovely human! Look at docs at https://github.com/telemark/hapi-auth-saml'
  }
  reply(message)
}

exports.ping = (request, reply) => {
  const message = { ping: 'pong' }
  logger('info', 'ping')
  reply(message)
}

exports.logoutResponse = (request, reply) => {
  reply.redirect(config.route.logoutRedir)
}

exports.login = (request, reply) => {
  const saml = request.server.plugins['hapi-passport-saml'].instance
  if (!request.query.origin) {
    logger('info', 'No origin param set')
    reply('No origin param set').code(500)
  } else {
    request.yar.set('origin', request.query.origin)
    logger('info', `Set origin to ${request.query.origin} in yar ${request.yar.id}`)
    saml.getAuthorizeUrl({
      headers: request.headers,
      body: request.payload,
      query: request.query
    }, (err, loginUrl) => {
      if (err) {
        logger('error', err)
        reply('Something failed').code(500)
      } else {
        logger('info', `Redirecting to ${loginUrl}`)
        reply.redirect(loginUrl)
      }
    })
  }
}

exports.assert = (request, reply) => {
  const saml = request.server.plugins['hapi-passport-saml'].instance

  if (request.payload.SAMLRequest) {
    // Implement your SAMLRequest handling here
    logger('error', request.payload.SAMLRequest)
    reply('Something failed in SAMLRequest').code(500)
  }
  if (request.payload.SAMLResponse) {
    // Handles SP use cases, e.g. IdP is external and SP is Hapi
    console.log(request.payload)
    saml.validatePostResponse(request.payload, async (err, profile) => {
      if (err) {
        logger('error', err)
        reply('Something failed in validating response from IdP').code(500)
      } else {
        // Data recived from IdP
        logger('info', profile)

        const session = await saveSession(profile)
        const jwt = generateJwt(Object.assign({sessionKey: session}, profile))

        // Save profile for logout in yar
        const origin = request.yar.get('origin')
        logger('info', `Get origin ${origin} from ${request.yar.id}`)
        request.yar.set('profile', profile)
        const redirUrl = `${origin}/?jwt=${jwt}`
        logger('info', `Redirecting to ${redirUrl}`)
        reply.redirect(redirUrl)
      }
    })
  }
}

exports.logout = (request, reply) => {
  const saml = request.server.plugins['hapi-passport-saml'].instance
  request.user = request.yar.get('profile')

  // if no yar session exist, its not possible to log out the user
  if (!request.user) {
    logger('info', 'User not logged in trying to log out')
    reply('Not logged in').code(500)
  } else {
    saml.getLogoutUrl(request, (err, url) => {
      if (err) {
        logger('error', err)
        reply('Something failed at logging out').code(500)
      } else {
        logger('info', 'User logged out')
        request.yar.clear('profile')
        request.yar.reset()
        logger('info', `Redirecting to ${url}`)
        reply.redirect(url)
      }
    })
  }
}
