'use strict'

const gulp = require('gulp')
const WSlibp2p = require('libp2p-websockets')
const multiaddr = require('multiaddr')

const spdy = require('./src')

let listener

gulp.task('test:browser:before', (done) => {
  const ws = new WSlibp2p()
  const mh = multiaddr('/ip4/127.0.0.1/tcp/9095/ws')
  listener = ws.createListener((transportSocket) => {
    const muxedConn = spdy(transportSocket, true)

    muxedConn.on('stream', (connRx) => {
      const connTx = muxedConn.newStream()
      connRx.pipe(connTx)
      connTx.pipe(connRx)
    })
  })
  listener.listen(mh, done)
})

gulp.task('test:browser:after', (done) => {
  listener.close(done)
})

require('aegir/gulp')(gulp)
