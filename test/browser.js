/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const WSlibp2p = require('libp2p-websockets')
const multiaddr = require('multiaddr')
const pull = require('pull-stream')
const goodbye = require('pull-goodbye')

const spdy = require('../src')

describe('browser-server', () => {
  let ws

  before(() => {
    ws = new WSlibp2p()
  })

  it('ricochet test', (done) => {
    const mh = multiaddr('/ip4/127.0.0.1/tcp/9095/ws')
    const transportSocket = ws.dial(mh)
    const muxedConn = spdy.dial(transportSocket)

    muxedConn.on('stream', (conn) => {
      console.log('onstream')
      const s = goodbye({
        source: pull.empty(),
        sink: pull.collect((err, chunks) => {
          console.log('collect', err, chunks)
          expect(chunks).to.be.eql(['hey'])
        })
      })
      pull(s, conn, s)
    })

    const conn = muxedConn.newStream()
    console.log('writing')
    const s = goodbye({
      source: pull.values(['hey']),
      sink: pull.onEnd(done)
    })
    pull(s, conn, s)
  })
})
