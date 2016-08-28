'use strict'

const spdy = require('spdy-transport')

const Muxer = require('./muxer')
const SPDY_CODEC = require('./spdy-codec')

function create (conn, isListener) {
  // Let it flow, let it flooow
  // conn.resume()

  const spdyMuxer = spdy.connection.create(conn, {
    protocol: 'spdy',
    isServer: isListener
  })

  return new Muxer(conn, spdyMuxer)
}

exports.multicodec = SPDY_CODEC
exports.dial = (conn) => create(conn, false)
exports.listen = (conn) => create(conn, true)
