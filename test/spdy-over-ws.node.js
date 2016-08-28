/* eslint-env mocha */
'use strict'


const expect = require('chai').expect
const WSlibp2p = require('libp2p-websockets')
const multiaddr = require('multiaddr')
const path = require('path')
const fs = require('fs')
const pull = require('pull-stream')
const file = require('pull-file')

const spdy = require('../src')

describe('spdy-over-ws', () => {
  let listener
  let dialer

  let ws
  let mh = multiaddr('/ip4/127.0.0.1/tcp/9090/ws')

  before(() => {
    ws = new WSlibp2p()
  })

  it('attach to a websocket, as listener', (done) => {
    const wsListener = ws.createListener((socket) => {
      expect(socket).to.exist
      listener = spdy.listen(socket)
      expect(listener).to.exist
    })

    wsListener.listen(mh, done)
  })

  it('attach to a websocket, as dialer', (done) => {
    const socket = ws.dial(mh)
    expect(socket).to.exist
    dialer = spdy.dial(socket)
    expect(dialer).to.exist
    done()
  })

  it('open a multiplex stream from dialer', (done) => {
    listener.once('stream', (conn) => {
      pull(conn, conn)
    })

    pull(
      pull.empty(),
      dialer.newStream(),
      pull.onEnd(done)
    )
  })

  it('open a multiplex stream from listener', (done) => {
    dialer.once('stream', (conn) => {
      pull(conn, conn)
    })

    pull(
      pull.empty(),
      listener.newStream(),
      pull.onEnd(done)
    )
  })

  it('open a spdy stream from dialer and write to it', (done) => {
    listener.once('stream', (conn) => {
      pull(conn, conn)
    })

    pull(
      pull.values(['hello world']),
      dialer.newStream(),
      pull.collect((err, data) => {
        expect(err).to.not.exist
        expect(data[0].toString()).to.equal('hello world')
        done()
      })
    )
  })

  it('open a spdy stream from listener and write to it', (done) => {
    dialer.once('stream', (conn) => {
      pull(conn, conn)
    })

    pull(
      pull.values(['hello world']),
      listener.newStream(),
      pull.collect((err, data) => {
        expect(err).to.not.exist
        expect(data[0].toString()).to.equal('hello world')
        done()
      })
    )
  })

  it('open a spdy stream from listener and write a lot', (done) => {
    dialer.once('stream', (conn) => {
      pull(conn, conn)
    })

    const filePath = path.join(process.cwd(), '/test/test-data/1.2MiB.txt')
    pull(
      file(filePath),
      listener.newStream(),
      pull.collect((err, data) => {
        expect(err).to.not.exist
        const expected = fs.readFileSync(filePath)
        expect(data[0]).to.deep.equal(expected)
        done()
      })
    )
  })
})
