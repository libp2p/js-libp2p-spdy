'use strict'

const tape = require('tape')
const tests = require('interface-stream-muxer')
const spdy = require('./../src')

const common = {
  setup: (t, cb) => cb(null, spdy),
  teardown: (t, cb) => cb()
}

tests(tape, common)
