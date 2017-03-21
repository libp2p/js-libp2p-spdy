/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const WSlibp2p = require('libp2p-websockets')
const multiaddr = require('multiaddr')
const path = require('path')
const fs = require('fs')
const pull = require('pull-stream')
const file = require('pull-file')

const spdy = require('../src')

describe('spdy-over-ws', () => {
  const mh = multiaddr('/ip4/127.0.0.1/tcp/9091/ws')

  let listener
  let dialer
  let ws

  before((done) => {
    ws = new WSlibp2p()

    let i = 0
    const finish = () => {
      i++
      return i === 2 ? done() : null
    }

    const wsListener = ws.createListener((socket) => {
      expect(socket).to.exist()
      listener = spdy.listener(socket)
      expect(listener).to.exist()
      finish()
    })

    const socket = ws.dial(mh)

    wsListener.listen(mh, () => {
      dialer = spdy.dialer(socket)
      expect(dialer).to.exist()
      finish()
    })
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
        expect(err).to.not.exist()
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
        expect(err).to.not.exist()
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
        expect(err).to.not.exist()
        const expected = fs.readFileSync(filePath)
        expect(Buffer.concat(data)).to.deep.equal(expected)
        done()
      })
    )
  })
})
