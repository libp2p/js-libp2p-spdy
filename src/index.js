'use strict'
/**
 * @module js-libp2p-spdy
 */

const spdy = require('spdy-transport')
const toStream = require('pull-stream-to-stream')

const Muxer = require('./muxer')
const SPDY_CODEC = require('./spdy-codec')

/**
 * create
 * @param {*} rawConn 
 * @param {*} isListener 
 */
function create (rawConn, isListener) {
  const conn = toStream(rawConn)
  conn.on('end', () => conn.destroy())

  const spdyMuxer = spdy.connection.create(conn, {
    protocol: 'spdy',
    isServer: isListener
  })

  return new Muxer(rawConn, spdyMuxer)
}

exports = module.exports = create
/**
 * @type {string}
 */
exports.multicodec = SPDY_CODEC
/**
 * @type {function}
 * @param {*} conn
 */
exports.dialer = (conn) => create(conn, false)
/**
 * @type {function}
 *  @param {*} conn
 */
exports.listener = (conn) => create(conn, true)
