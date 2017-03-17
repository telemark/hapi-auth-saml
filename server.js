'use strict'

const Hapi = require('hapi')
const config = require('./config')
const routes = require('./routes')
const plugins = require('./plugins')

// Create a server with a host and port
const server = new Hapi.Server()

server.connection({
  port: config.SERVER_PORT
})

// Register plugins
server.register(plugins, err => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
})

// Add the routes
server.route(routes)

// Start the server
module.exports.start = () => {
  server.start(() => {
    server.log(`Server running at: ${server.info.uri}`)
  })
}

// Stop the server
module.exports.stop = () => {
  server.stop(() => {
    console.log('Server stopped')
  })
}
