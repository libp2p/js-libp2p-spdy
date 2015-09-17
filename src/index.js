var spdy = require('spdy-transport')
var multistream = require('multistream-select')
var EventEmitter = require('events').EventEmitter
var util = require('util')
var DuplexPassThrough = require('duplex-passthrough')

exports = module.exports = SpdyStreamMuxer
util.inherits(Connection, EventEmitter)

function SpdyStreamMuxer () {
  var self = this

  self.attach = function (transport, isListener, callback) {
    if (isListener) {
      var mss = new multistream.Select()
      mss.handle(transport)
      mss.addHandler('/spdy/3.1.0', function (ds) {
        createConnection(ds, callback)
      })
    } else {
      var msi = new multistream.Interactive()
      msi.handle(transport, function () {
        msi.select('/spdy/3.1.0', function (err, ds) {
          if (err) {
            return callback(err)
          }
          createConnection(ds, callback)
        })
      })
    }

    function createConnection (transport, cb) {
      var conn = spdy.connection.create(transport, {
        protocol: 'spdy',
        isServer: isListener
      })
      conn.start(3.1)
      cb(null, new Connection(conn))
    }
  }
}

function Connection (conn) {
  var self = this

  self.dialStream = function (callback) {
    var ds = new DuplexPassThrough()

    conn.request({
      method: 'POST',
      path: '/',
      headers: {}
    }, function (err, stream) {
      if (err) {
        ds.emit('err', err)
        if (callback) { callback(err) }
        return
      }
      ds.wrapStream(stream)
      ds.emit('ready')
      if (callback) { callback(null, ds) }
    })

    return ds
  }

  conn.on('stream', function (stream) {
    stream.respond(200, {})
    self.emit('stream', stream)
  })

  conn.on('close', function () {
    self.emit('close', null)
  })

  conn.on('error', function (err) {
    self.emit('error', err)
  })

  self.end = function (cb) {
    conn.end(cb)
  }
}
