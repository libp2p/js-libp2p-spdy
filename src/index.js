'use strict'

const spdy = require('spdy-transport')
const toStream = require('pull-stream-to-stream')

const Muxer = require('./muxer')
const SPDY_CODEC = require('./spdy-codec')

function create (rawConn, isListener) {
  const conn = toStream(rawConn)
  // Let it flow, let it flooow
  conn.resume()

  const spdyMuxer = spdy.connection.create(conn, {
    protocol: 'spdy',
    isServer: isListener
  })

  return new Muxer(rawConn, spdyMuxer)
}

exports.multicodec = SPDY_CODEC
exports.dial = (conn) => create(conn, false)
exports.listen = (conn) => create(conn, true)
