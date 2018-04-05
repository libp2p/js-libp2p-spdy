'use strict'

const WSlibp2p = require('libp2p-websockets')
const multiaddr = require('multiaddr')
const pull = require('pull-stream')

const spdy = require('./src')

let listener

function pre (done) {
  const ws = new WSlibp2p()
  const mh = multiaddr('/ip4/127.0.0.1/tcp/9095/ws')
  listener = ws.createListener((transportSocket) => {
    const muxedConn = spdy.listener(transportSocket)
    muxedConn.on('stream', (connRx) => {
      const connTx = muxedConn.newStream()
      pull(connRx, connTx, connRx)
    })
  })

  listener.listen(mh, done)
}

function post (done) {
  listener.close(done)
}

module.exports = {
  karma: {
    files: [{
      pattern: 'node_modules/interface-ipfs-core/js/test/fixtures/**/*',
      watched: false,
      served: true,
      included: false
    }],
    browserNoActivityTimeout: 150 * 1000,
    singleRun: true
  },
  hooks: {
    pre: pre,
    post: post
  }
}
