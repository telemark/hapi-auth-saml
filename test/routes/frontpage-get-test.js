'use strict'

const test = require('ava')
const Hapi = require('hapi')
const routes = require('../../routes')

const server = new Hapi.Server()
server.connection()
server.route(routes)

test('it returns frontpage', async t => {
  server.inject('/', res => {
    t.true(res.result.message.includes('Hello'), 'frontpage ok')
  })
})

test('it returns pong', async t => {
  server.inject('/ping', res => {
    t.true(res.result.ping.includes('pong'), 'ping pong ok')
  })
})
