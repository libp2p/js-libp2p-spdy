var tape = require('tape')
var tests = require('./compliance')
var SpdyStreamMuxer = require('../src')

var common = {
  setup: function (t, cb) {
    cb(null, SpdyStreamMuxer)
  },
  teardown: function (t, cb) {
    cb()
  }
}

tests(tape, common)
