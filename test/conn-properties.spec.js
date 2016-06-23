'use strict'
/* eslint-env mocha */

const expect = require('chai').expect
const TCP = require('libp2p-tcp')
const spdy = require('../src')

describe('conn properties are propagated to each stream', () => {
  let listenerSocket
  let dialerSocket

  let listener
  let dialer

  before((done) => {
    done()
  })

  after((done) => {
    done()
  })

  it.skip('getObservedAddrs', (done) => {
    listener = spdy(listenerSocket, true)
    expect(listener).to.exist
    done()
  })

  it.skip('getPeerInfo yields error', (done) => {
    dialer = spdy(dialerSocket, false)
    expect(dialer).to.exist
    done()
  })

  it.skip('setPeerInfo on muxedConn, verify that it is the same on conn', (done) => {
  })

  it.skip('wrap the muxed stream in another Conn, see how everything still trickles', (done) => {})

  it.skip('open several streams, see how they all pack the same info', (done) => {})
})
