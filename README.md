⛔️ DEPRECATED
libp2p-spdy is now deprecated in libp2p and will no longer be maintained. Please visit https://github.com/libp2p/js-libp2p#packages for a list of supported stream multiplexers available for js-libp2p.

js-libp2p-spdy
==============

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![](https://img.shields.io/badge/freenode-%23libp2p-yellow.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23libp2p)
[![Discourse posts](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg)](https://discuss.libp2p.io)
[![](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-spdy.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-spdy)
[![Dependency Status](https://david-dm.org/libp2p/js-libp2p-spdy.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-spdy)
[![](https://img.shields.io/travis/libp2p/js-libp2p-spdy.svg?style=flat-square)](https://travis-ci.com/libp2p/js-libp2p-spdy)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> SPDY 3.1 implementation wrapper that is compatible with libp2p Stream Muxer expected interface

[![](https://github.com/libp2p/interface-stream-muxer/raw/master/img/badge.png)](https://github.com/libp2p/interface-stream-muxer)

## Lead Maintainer

[Jacob Heun](https://github/jacobheun)

## Installation

### npm

```sh
> npm i libp2p-spdy
```

### Use in Node.js

```js
const spdy = require('libp2p-spdy')
```

### Use in a browser with browserify, webpack or any other bundler

The code published to npm that gets loaded on require is in fact a ES5 transpiled version with the right shims added. This means that you can require it and use with your favourite bundler without having to adjust asset management process.

```JavaScript
var spdy = require('libp2p-spdy')
```

### Use in a browser Using a script tag

Loading this module through a script tag will make the `Lip2pSpdy` obj available in the global namespace.

```html
<script src="https://unpkg.com/libp2p-spdy/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/libp2p-spdy/dist/index.js"></script>
```

## Usage

### API

#### Attaching it to a socket (duplex stream)

**As a listener**

```JavaScript
const listener = spdy(conn, true)
```

**As a dialer**

```JavaScript
const dialer = spdy(conn, false)
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

### This module uses `pull-streams`

We expose a streaming interface based on `pull-streams`, rather then on the Node.js core streams implementation (aka Node.js streams). `pull-streams` offers us a better mechanism for error handling and flow control guarantees. If you would like to know more about why we did this, see the discussion at this [issue](https://github.com/ipfs/js-ipfs/issues/362).

You can learn more about pull-streams at:

- [The history of Node.js streams, nodebp April 2014](https://www.youtube.com/watch?v=g5ewQEuXjsQ)
- [The history of streams, 2016](http://dominictarr.com/post/145135293917/history-of-streams)
- [pull-streams, the simple streaming primitive](http://dominictarr.com/post/149248845122/pull-streams-pull-streams-are-a-very-simple)
- [pull-streams documentation](https://pull-stream.github.io/)

#### Converting `pull-streams` to Node.js Streams

If you are a Node.js streams user, you can convert a pull-stream to a Node.js stream using the module [`pull-stream-to-stream`](https://github.com/pull-stream/pull-stream-to-stream), giving you an instance of a Node.js stream that is linked to the pull-stream. For example:

```js
const pullToStream = require('pull-stream-to-stream')

const nodeStreamInstance = pullToStream(pullStreamInstance)
// nodeStreamInstance is an instance of a Node.js Stream
```

To learn more about this utility, visit https://pull-stream.github.io/#pull-stream-to-stream.


