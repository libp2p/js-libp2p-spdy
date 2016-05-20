'use strict'

const tcp = require('net')
const libp2pSPDY = require('../src')

const listener = tcp.createServer((socket) => {
  console.log('-> got connection')

  const muxer = libp2pSPDY(socket, true)

  muxer.on('stream', (stream) => {
    console.log('-> got new muxed stream')
    stream.on('data', (data) => {
      console.log('DO I GET DATA?', data)
    })
    stream.pipe(stream)
  })

  console.log('-> opening a stream from my side')
  muxer.newStream((err, stream) => {
    if (err) {
      throw err
    }
    console.log('-> opened the stream')
    stream.write('hey, how is it going')
    stream.end()
  })
})

listener.listen(9999, () => {
  console.log('-> listening on 9999')
})
