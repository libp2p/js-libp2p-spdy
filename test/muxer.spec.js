/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
chai.use(require('chai-checkmark'))
const expect = chai.expect
const sinon = require('sinon')

const spdy = require('spdy-transport')
const pair = require('pull-pair/duplex')
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
})
