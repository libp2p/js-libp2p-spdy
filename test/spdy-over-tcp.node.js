/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
chai.use(require('chai-checkmark'))
const sinon = require('sinon')
const expect = chai.expect
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
  let tcpListener

  let tcp
  let mh = multiaddr('/ip4/127.0.0.1/tcp/9090')

  before(() => {
    tcp = new Tcp()
  })
  after((done) => {
    tcpListener.close(done)
  })
  afterEach(() => {
    sinon.restore()
  })

  it('attach to a tcp socket, as listener', (done) => {
    tcpListener = tcp.createListener((socket) => {
      expect(socket).to.exist()
      listener = spdy.listener(socket)
      expect(listener).to.exist()
    })

    tcpListener.listen(mh, done)
  })

  it('attach to a tcp socket, as dialer', (done) => {
    expect(3).checks(done)
    const socket = tcp.dial(mh, (err) => {
      expect(err).to.not.exist().mark()
    })
    expect(socket).to.exist().mark()
    dialer = spdy.dialer(socket)
    expect(dialer).to.exist().mark()
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
