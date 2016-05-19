'use strict'

const tcp = require('net')
const libp2pSPDY = require('../src')

const socket = tcp.connect(9999)
const muxer = libp2pSPDY(socket, false)

muxer.on('stream', (stream) => {
  console.log('-> got new muxed stream')
  stream.on('data', (data) => {
    console.log('do I ever get data?', data)
  })
  stream.pipe(stream)
})

console.log('-> opening a stream from my side')
muxer.newStream((err, stream) => {
  if (err) {
    throw err
  }

  console.log('-> opened the stream')
  stream.write('hey, how is it going. I am dialer')
  stream.end()
})
