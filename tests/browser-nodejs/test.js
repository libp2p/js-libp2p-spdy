const karma = require('karma')
const path = require('path')
const WSlibp2p = require('libp2p-websockets')
const multiaddr = require('multiaddr')
const spdy = require('./../../src')

var ws

function createListener (done) {
  ws = new WSlibp2p()
  const mh = multiaddr('/ip4/127.0.0.1/tcp/9095/websockets')
  ws.createListener(mh, (socket) => {
    const listener = spdy(socket, true)

    listener.on('stream', (connRx) => {
      listener.newStream((err, connTx) => {
        if (err) {
          throw err
        }

        connRx.pipe(connTx)
      })
    })
  }, done)
}

function stopServer (done) {
  ws.close(done)
}

function run (done) {
  const karmaServer = new karma.Server({
    configFile: path.join(__dirname, '../../karma.conf.js')
  }, done)

  return karmaServer.start()
}

createListener(() => run((exitCode) => stopServer(() => process.exit(exitCode))))
