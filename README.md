js-libp2p-spdy
==============

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Coverage Status](https://coveralls.io/repos/github/libp2p/js-libp2p-spdy/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-libp2p-spdy?branch=master)
[![Dependency Status](https://david-dm.org/libp2p/js-libp2p-spdy.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-spdy)
[![Travis CI](https://travis-ci.org/libp2p/js-libp2p-spdy.svg?branch=master)](https://travis-ci.org/libp2p/js-libp2p-spdy)
[![Circle CI](https://circleci.com/gh/libp2p/js-libp2p-spdy.svg?style=svg)](https://circleci.com/gh/libp2p/js-libp2p-spdy)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> SPDY 3.1 implementation wrapper that is compatible with libp2p Stream Muxer expected interface

[![](https://github.com/libp2p/interface-stream-muxer/raw/master/img/badge.png)](https://github.com/libp2p/interface-stream-muxer)

# Installation

## npm

```sh
> npm i libp2p-spdy
```

## Use in Node.js

```js
const spdy = require('libp2p-spdy')
```

## Use in a browser with browserify, webpack or any other bundler

The code published to npm that gets loaded on require is in fact a ES5 transpiled version with the right shims added. This means that you can require it and use with your favourite bundler without having to adjust asset management process.

```JavaScript
var spdy = require('libp2p-spdy')
```

## Use in a browser Using a script tag

Loading this module through a script tag will make the `Lip2pSpdy` obj available in the global namespace.

```html
<script src="https://npmcdn.com/libp2p-spdy/dist/index.min.js"></script>
<!-- OR -->
<script src="https://npmcdn.com/libp2p-spdy/dist/index.js"></script>
```

# Usage

## API

#### Attaching it to a socket (duplex stream)

**As a listener**

```JavaScript
const listener = spdy(socket, true)
```

**As a dialer**

```JavaScript
const dialer = spdy(socket, false)
```

#### Opening a multiplex duplex stream

```JavaScript
const conn = dialer.newStream((err, conn) => {})

conn.on('error', (err) => {})
```

note: Works the same on the listener side

#### Receiving incoming stream

```JavaScript
dialer.on('stream', (conn) => {})
```

note: Works the same on the listener side

#### Close

```JavaScript
dialer.close()
```

note: Works the same on the listener side

#### Other events

```JavaScript
dialer.on('close', () => {})
dialer.on('error', () => {})
```

note: Works the same on the listener side
