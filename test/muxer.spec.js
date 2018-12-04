/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
chai.use(require('chai-checkmark'))
const expect = chai.expect
const sinon = require('sinon')

const spdy = require('spdy-transport')
const pair = require('pull-pair/duplex')
const pull = require('pull-stream')
const toStream = require('pull-stream-to-stream')

const Muxer = require('../src/muxer')

describe('multiplex-muxer', () => {
  let muxer
  let spdyMuxer

  afterEach(() => {
    sinon.restore()
  })

  it('can be created', () => {
    const p = pair()
    spdyMuxer = spdy.connection.create(toStream(p), {
      protocol: 'spdy',
      isServer: false
    })
    muxer = new Muxer(p, spdyMuxer)
  })

  it('catches newStream errors', (done) => {
    sinon.stub(spdyMuxer, 'request').callsFake((_, cb) => {
      cb(new Error('something bad happened'))
    })

    muxer.newStream((err) => {
      expect(err).to.exist()
      expect(err.message).to.equal('something bad happened')
      done()
    })
  })

  it('catches stream errors', (done) => {
    const stream = muxer.newStream((err) => {
      expect(err).to.not.exist()
      pull(
        pull.error(Object.assign(new Error('ECONNRESET')), {
          code: 'ECONNRESET'
        }),
        stream,
        pull.onEnd((err) => {
          expect(err).to.not.exist()
          done()
        })
      )
    })
  })

  // This logic can be removed once spdy-transport doesn't emit empty errors
  it('should not emit an error when spdy emits an empty error', () => {
    muxer.once('error', expect.fail)
    muxer.spdy.emit('error')
    muxer.removeListener('error', expect.fail)
  })

  it('can get destroyed', (done) => {
    const spy = sinon.spy(spdyMuxer, 'destroyStreams')
    expect(2).checks(done)

    muxer.end((err) => {
      expect(err).to.not.exist().mark()

      // End it again to test accidental duplicate close
      muxer.end((err) => {
        expect(spy.callCount).to.eql(2)
        expect(err).to.not.exist().mark()
      })
    })
  })

  it('.end should not require a callback', () => {
    const stub = sinon.stub(spdyMuxer, 'end').callsFake((cb) => {
      cb()
    })

    muxer.end()
    expect(stub.callCount).to.eql(1)
  })

  it('should emit an error if spdy does', (done) => {
    muxer.once('error', (err) => {
      expect(err.code).to.eql('ERR_UNKNOWN')
      done()
    })

    muxer.spdy.emit('error', Object.assign(new Error('bad things'), {
      code: 'ERR_UNKNOWN'
    }))
  })

  it('should not throw if there are no error listeners', () => {
    muxer.removeAllListeners('error')

    muxer.spdy.emit('error', Object.assign(new Error('bad things'), {
      code: 'ERR_UNKNOWN'
    }))
  })
})
