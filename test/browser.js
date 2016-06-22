/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const WSlibp2p = require('libp2p-websockets')
const spdy = require('../src')
const multiaddr = require('multiaddr')

describe('browser-server', () => {
  let ws

  before(() => {
    ws = new WSlibp2p()
  })

  it('ricochet test', (done) => {
    const mh = multiaddr('/ip4/127.0.0.1/tcp/9095/ws')
    const transportSocket = ws.dial(mh)
    const muxedConn = spdy(transportSocket, false)

    muxedConn.on('stream', (conn) => {
      conn.on('data', (data) => {
        expect(data.toString()).to.equal('hey')
      })

      conn.on('end', () => {
        conn.end()
      })
    })

    const conn = muxedConn.newStream()
    conn.write('hey')
    conn.end()
    conn.on('data', () => {}) // let it floooow
    conn.on('end', done)
  })
})
