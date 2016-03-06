var tape = require('tape')
var tests = require('./index')
var spdy = require('./../../src')

var common = {
  setup: function (t, cb) {
    cb(null, spdy)
  },
  teardown: function (t, cb) {
    cb()
  }
}

tests(tape, common)
