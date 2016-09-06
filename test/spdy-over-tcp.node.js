/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const Tcp = require('libp2p-tcp')
const multiaddr = require('multiaddr')
const path = require('path')
const fs = require('fs')
const pull = require('pull-stream')
const file = require('pull-file')

const spdy = require('../src')

describe('spdy-over-tcp', () => {
  let listener
  let dialer

  let tcp
  let mh = multiaddr('/ip4/127.0.0.1/tcp/9090')

  before(() => {
    tcp = new Tcp()
  })

  it('attach to a tcp socket, as listener', (done) => {
    const tcpListener = tcp.createListener((socket) => {
      expect(socket).to.exist
      listener = spdy.listener(socket)
      expect(listener).to.exist
    })

    tcpListener.listen(mh, done)
  })

  it('attach to a tcp socket, as dialer', (done) => {
    const socket = tcp.dial(mh)
    expect(socket).to.exist
    dialer = spdy.dialer(socket)
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
        expect(Buffer.concat(data)).to.deep.equal(expected)
        done()
      })
    )
  })
})
