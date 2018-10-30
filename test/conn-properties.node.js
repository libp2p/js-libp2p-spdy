'use strict'
/* eslint-env mocha */

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const TCP = require('libp2p-tcp')
const Connection = require('interface-connection').Connection
const multiaddr = require('multiaddr')
const pull = require('pull-stream')
const parallel = require('run-parallel')

const spdy = require('../src')

describe('conn properties are propagated to each stream', () => {
  let lMuxer
  let dMuxer
  let dConn
  let listener

  before(() => {
    const dtcp = new TCP()
    const ltcp = new TCP()
    const ma = multiaddr('/ip4/127.0.0.1/tcp/9876')
    listener = ltcp.createListener((conn) => {
      lMuxer = spdy.listener(conn)
      lMuxer.on('stream', (conn) => {
        pull(conn, conn)
      })
    })

    listener.listen(ma)
    dConn = dtcp.dial(ma)
    dMuxer = spdy.dialer(dConn)
  })

  after((done) => {
    listener.close(done)
  })

  it('getObservedAddrs', (done) => {
    let oa1
    let oa2

    parallel([
      (cb) => {
        const conn = dMuxer.newStream()
        conn.getObservedAddrs((err, addrs) => {
          expect(err).to.not.exist()
          oa1 = addrs
          pull(pull.empty(), conn, pull.onEnd(cb))
        })
      },
      (cb) => {
        dConn.getObservedAddrs((err, addrs) => {
          expect(err).to.not.exist()
          oa2 = addrs
          cb()
        })
      }
    ], () => {
      expect(oa1).to.deep.equal(oa2)
      done()
    })
  })

  it('getPeerInfo yields error', (done) => {
    const conn = dMuxer.newStream()
    conn.getPeerInfo((err, pInfo) => {
      expect(err).to.exist()
      pull(pull.empty(), conn, pull.onEnd(done))
    })
  })

  it('setPeerInfo on muxedConn, verify that it is the same on conn', (done) => {
    const conn = dMuxer.newStream()
    conn.setPeerInfo('banana')
    parallel([
      (cb) => {
        conn.getPeerInfo((err, pInfo) => {
          expect(err).to.not.exist()
          expect(pInfo).to.equal('banana')
          pull(pull.empty(), conn, pull.onEnd(cb))
        })
      },
      (cb) => {
        dConn.getPeerInfo((err, pInfo) => {
          expect(err).to.not.exist()
          expect(pInfo).to.equal('banana')
          cb()
        })
      }
    ], done)
  })

  it('wrap the muxed stream in another Conn, see how everything still trickles', (done) => {
    const conn = dMuxer.newStream()
    const proxyConn = new Connection(conn)
    proxyConn.getPeerInfo((err, pInfo) => {
      expect(err).to.not.exist()
      expect(pInfo).to.equal('banana')
      pull(pull.empty(), conn, pull.onEnd(done))
    })
  })

  it('open several streams, see how they all pack the same info', (done) => {
    const conn1 = dMuxer.newStream()
    const conn2 = dMuxer.newStream()
    const conn3 = dMuxer.newStream()
    const conn4 = dMuxer.newStream()

    parallel([
      (cb) => {
        conn1.getPeerInfo((err, pInfo) => {
          expect(err).to.not.exist()
          expect(pInfo).to.equal('banana')
          pull(pull.empty(), conn1, pull.onEnd(cb))
        })
      },
      (cb) => {
        conn2.getPeerInfo((err, pInfo) => {
          expect(err).to.not.exist()
          expect(pInfo).to.equal('banana')
          pull(pull.empty(), conn2, pull.onEnd(cb))
        })
      },
      (cb) => {
        conn3.getPeerInfo((err, pInfo) => {
          expect(err).to.not.exist()
          expect(pInfo).to.equal('banana')
          pull(pull.empty(), conn3, pull.onEnd(cb))
        })
      },
      (cb) => {
        conn4.getPeerInfo((err, pInfo) => {
          expect(err).to.not.exist()
          expect(pInfo).to.equal('banana')
          pull(pull.empty(), conn4, pull.onEnd(cb))
        })
      }
    ], done)
  })

  it('setPeerInfo on conn, verify that it is the same on muxedConn', (done) => {
    const conn = dMuxer.newStream()
    dConn.setPeerInfo('pineapple')
    parallel([
      (cb) => {
        conn.getPeerInfo((err, pInfo) => {
          expect(err).to.not.exist()
          expect(pInfo).to.equal('pineapple')
          pull(pull.empty(), conn, pull.onEnd(cb))
        })
      },
      (cb) => {
        dConn.getPeerInfo((err, pInfo) => {
          expect(err).to.not.exist()
          expect(pInfo).to.equal('pineapple')
          cb()
        })
      }
    ], done)
  })
})
