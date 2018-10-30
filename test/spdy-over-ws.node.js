/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
chai.use(require('chai-checkmark'))
const expect = chai.expect
const sinon = require('sinon')
const WSlibp2p = require('libp2p-websockets')
const multiaddr = require('multiaddr')
const path = require('path')
const fs = require('fs')
const pull = require('pull-stream')
const file = require('pull-file')

const spdy = require('../src')

describe('spdy-over-ws', () => {
  const mh = multiaddr('/ip4/127.0.0.1/tcp/9091/ws')

  let wsListener
  let listener
  let dialer
  let ws

  before((done) => {
    ws = new WSlibp2p()

    expect(2).checks(done)

    wsListener = ws.createListener((socket) => {
      expect(socket).to.exist()
      listener = spdy.listener(socket)
      expect(listener).to.exist().mark()
    })

    const socket = ws.dial(mh)

    wsListener.listen(mh, () => {
      dialer = spdy.dialer(socket)
      expect(dialer).to.exist().mark()
    })
  })

  after((done) => {
    wsListener.close(done)
  })
  afterEach(() => {
    sinon.restore()
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

  it('should be able to end the muxer', (done) => {
    expect(2).checks(done)
    const spy = sinon.spy(dialer.spdy, 'destroyStreams')

    listener.once('error', (err) => {
      expect.fail(err)
    })
    listener.once('close', (didError) => {
      expect(didError).to.eql(false).mark()
    })

    dialer.end((err) => {
      expect(spy.calledOnce).to.eql(true)
      expect(err).to.not.exist().mark()
    })
  })
})
