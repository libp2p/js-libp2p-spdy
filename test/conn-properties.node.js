'use strict'
/* eslint-env mocha */

const expect = require('chai').expect
const TCP = require('libp2p-tcp')
const Connection = require('interface-connection').Connection
const spdy = require('../src')
const multiaddr = require('multiaddr')
const parallel = require('run-parallel')

describe('conn properties are propagated to each stream', () => {
  let lMuxer
  let dMuxer
  let dConn
  let listener

  before((done) => {
    const dtcp = new TCP()
    const ltcp = new TCP()
    const ma = multiaddr('/ip4/127.0.0.1/tcp/9876')
    listener = ltcp.createListener((conn) => {
      conn.on('error', () => {})
      lMuxer = spdy(conn, true)

      lMuxer.on('error', () => {})

      lMuxer.on('stream', (conn) => {
        conn.pipe(conn)
      })
    })

    listener.on('error', () => {})

    listener.listen(ma, dial)

    function dial () {
      dConn = dtcp.dial(ma)
      dConn.on('error', () => {})

      dConn.on('connect', () => {
        dMuxer = spdy(dConn, false)
        dMuxer.on('error', () => {})
        done()
      })
    }
  })

  after((done) => {
    parallel([
      (cb) => {
        dConn.destroy()
        dConn.on('close', cb)
      },
      listener.close
    ], done)
  })

  it('getObservedAddrs', (done) => {
    let oa1
    let oa2

    parallel([
      (cb) => {
        const conn = dMuxer.newStream()
        conn.getObservedAddrs((err, addrs) => {
          expect(err).to.not.exist
          oa1 = addrs
          conn.resume()
          conn.on('end', cb)
          conn.end()
        })
      },
      (cb) => {
        dConn.getObservedAddrs((err, addrs) => {
          expect(err).to.not.exist
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
      expect(err).to.exist
      conn.resume()
      conn.on('end', done)
      conn.end()
    })
  })

  it('setPeerInfo on muxedConn, verify that it is the same on conn', (done) => {
    const conn = dMuxer.newStream()
    conn.setPeerInfo('banana')
    parallel([
      (cb) => {
        conn.getPeerInfo((err, pInfo) => {
          expect(err).to.not.exist
          expect(pInfo).to.equal('banana')
          conn.resume()
          conn.on('end', cb)
          conn.end()
        })
      },
      (cb) => {
        dConn.getPeerInfo((err, pInfo) => {
          expect(err).to.not.exist
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
      expect(err).to.not.exist
      expect(pInfo).to.equal('banana')
      conn.resume()
      conn.on('end', done)
      conn.end()
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
          expect(err).to.not.exist
          expect(pInfo).to.equal('banana')
          conn1.resume()
          conn1.on('end', cb)
          conn1.end()
        })
      },
      (cb) => {
        conn2.getPeerInfo((err, pInfo) => {
          expect(err).to.not.exist
          expect(pInfo).to.equal('banana')
          conn2.resume()
          conn2.on('end', cb)
          conn2.end()
        })
      },
      (cb) => {
        conn3.getPeerInfo((err, pInfo) => {
          expect(err).to.not.exist
          expect(pInfo).to.equal('banana')
          conn3.resume()
          conn3.on('end', cb)
          conn3.end()
        })
      },
      (cb) => {
        conn4.getPeerInfo((err, pInfo) => {
          expect(err).to.not.exist
          expect(pInfo).to.equal('banana')
          conn4.resume()
          conn4.on('end', cb)
          conn4.end()
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
          expect(err).to.not.exist
          expect(pInfo).to.equal('pineapple')
          conn.resume()
          conn.on('end', cb)
          conn.end()
        })
      },
      (cb) => {
        dConn.getPeerInfo((err, pInfo) => {
          expect(err).to.not.exist
          expect(pInfo).to.equal('pineapple')
          cb()
        })
      }
    ], done)
  })
})
