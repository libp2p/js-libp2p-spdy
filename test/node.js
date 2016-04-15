/* eslint-env mocha */
'use strict'

const fs = require('fs')

describe('spdy-node-tests', () => {
  fs.readdirSync(__dirname)
    .filter((file) => file.match(/\.node\.js$/))
    .forEach((file) => {
      require(`./${file}`)
    })
})
