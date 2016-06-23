'use strict'

const spdy = require('spdy-transport')
const Connection = require('interface-connection').Connection
const EE = require('events').EventEmitter

exports = module.exports = function (transport, isListener) {
  const muxer = spdy.connection.create(transport, {
    protocol: 'spdy',
    isServer: isListener
  })

  const proxyMuxer = new EE()

  muxer.start(3.1)

  // method added to enable pure stream muxer feeling
  proxyMuxer.newStream = (callback) => {
    if (!callback) {
      callback = noop
    }

    return new Connection(muxer.request({
      method: 'POST',
      path: '/',
      headers: {}
    }, callback))
  }

  // The rest of the API comes by default with SPDY
  muxer.on('close', () => {
    proxyMuxer.emit('close')
  })

  muxer.on('error', (err) => {
    proxyMuxer.emit('error', err)
  })

  proxyMuxer.end = () => {
    muxer.end()
  }

  // needed by other spdy impl that need the response headers
  // in order to confirm the stream can be open
  muxer.on('stream', (stream) => {
    stream.respond(200, {})
    const conn = new Connection(stream)
    proxyMuxer.emit('stream', conn)
  })

  proxyMuxer.multicodec = exports.multicodec
  return proxyMuxer
}

exports.multicodec = '/spdy/3.1.0'

function noop () {}
