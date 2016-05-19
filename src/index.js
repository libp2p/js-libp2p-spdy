'use strict'

const spdy = require('spdy-transport')

exports = module.exports = function (transport, isListener) {
  const muxer = spdy.connection.create(transport, {
    protocol: 'spdy',
    isServer: isListener
  })

  muxer.start(3.1)

  // method added to enable pure stream muxer feeling
  muxer.newStream = (callback) => {
    if (!callback) {
      callback = noop
    }

    return muxer.request({
      method: 'POST',
      path: '/',
      headers: {}
    }, callback)
  }

  // The rest of the API comes by default with SPDY
  // muxer.on('stream', (stream) => {})
  // muxer.on('close', () => {})
  // muxer.on('error', (err) => {})
  // muxer.end()

  // needed by other spdy impl that need the response headers in order
  // to confirm the stream can be open
  muxer.on('stream', (stream) => {
    stream.respond(200, {})
  })

  muxer.multicodec = exports.multicodec
  return muxer
}

exports.multicodec = '/spdy/3.1.0'

function noop () {}
