'use strict'

/* eslint-env mocha */

const expect = require('chai').expect
const WSlibp2p = require('libp2p-websockets')
const multiaddr = require('multiaddr')
const bl = require('bl')
const spdy = require('../src')
const path = require('path')
const fs = require('fs')

describe('spdy-over-ws', () => {
  let listener
  let dialer

  let ws
  let mh = multiaddr('/ip4/127.0.0.1/tcp/9090/ws')

  before((done) => {
    ws = new WSlibp2p()

    done()
  })

  it('attach to a websocket, as listener', (done) => {
    ws.createListener(mh, (socket) => {
      expect(socket).to.exist
      listener = spdy(socket, true)
      expect(listener).to.exist
    }, done)
  })

  it('attach to a websocket, as dialer', (done) => {
    const socket = ws.dial(mh)
    expect(socket).to.exist
    dialer = spdy(socket, false)
    expect(dialer).to.exist
    done()
  })

  it('open a multiplex stream from dialer', (done) => {
    listener.once('stream', (conn) => {
      conn.pipe(conn)
    })

    const conn = dialer.newStream()

    conn.on('error', (err) => {
      expect(err).to.not.exist
    })

    conn.on('data', () => {}) // otherwise data doesn't flow
    conn.on('end', done)
    conn.end()
  })

  it('open a multiplex stream from listener', (done) => {
    dialer.once('stream', (conn) => {
      conn.pipe(conn)
    })

    const conn = listener.newStream()

    conn.on('error', (err) => {
      expect(err).to.not.exist
    })

    conn.on('data', () => {}) // otherwise data doesn't flow
    conn.on('end', done)
    conn.end()
  })

  it('open a spdy stream from dialer and write to it', (done) => {
    listener.once('stream', (conn) => {
      conn.pipe(conn)
    })

    const conn = dialer.newStream()
    conn.write('hello world')
    conn.end()

    conn.on('error', (err) => {
      expect(err).to.not.exist
    })
    conn.pipe(bl((err, data) => {
      expect(err).to.not.exist
      expect(data.toString()).to.equal('hello world')
      done()
    }))
  })

  it('open a spdy stream from listener and write to it', (done) => {
    dialer.once('stream', (conn) => {
      conn.pipe(conn)
    })

    const conn = listener.newStream()
    conn.write('hello world')
    conn.end()

    conn.on('error', (err) => {
      expect(err).to.not.exist
    })
    conn.pipe(bl((err, data) => {
      expect(err).to.not.exist
      expect(data.toString()).to.equal('hello world')
      done()
    }))
  })

  it('open a spdy stream from listener and write a lot', (done) => {
    dialer.once('stream', (conn) => {
      conn.pipe(conn)
    })

    const filePath = path.join(process.cwd(), '/test/test-data/1.2MiB.txt')

    const conn = listener.newStream()
    fs.createReadStream(filePath).pipe(conn)

    conn.on('error', (err) => {
      expect(err).to.not.exist
    })

    conn.pipe(bl((err, data) => {
      expect(err).to.not.exist
      const expected = fs.readFileSync(filePath)
      expect(data).to.deep.equal(expected)
      done()
    }))
  })
})
