'use strict'

const gulp = require('gulp')
const WSlibp2p = require('libp2p-websockets')
const multiaddr = require('multiaddr')

const spdy = require('./src')

var ws

gulp.task('test:browser:before', (done) => {
  ws = new WSlibp2p()
  const mh = multiaddr('/ip4/127.0.0.1/tcp/9095/websockets')
  ws.createListener(mh, (transportSocket) => {
    const muxedConn = spdy(transportSocket, true)

    muxedConn.on('stream', (connRx) => {
      const connTx = muxedConn.newStream()
      connRx.pipe(connTx)
      connTx.pipe(connRx)
    })
  }, done)
})

gulp.task('test:browser:after', (done) => {
  ws.close(done)
})

require('aegir/gulp')(gulp)
