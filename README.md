hypercore-replicate
===================

A simple function to replicate multiple hypercores.

## Installation

```sh
$ npm install hypercore-replicate
```

## Usage

```js
const replicate = require('hypercore-replicate')
replicate(...hypercores, opts, callback)
```

## Example

```js
const replicate = require('hypercore-replicate')
const hypercore = require('hypercore')
const ram = require('random-access-memory')

const feed = hypercore(ram)
feed.ready(() => {
  const copy = hypercore(ram, feed.key)
  const other = hypercore(ram, feed.key)
  replicate(feed, copy, other.replicate(), { live: true })
  feed.append('hello')
  copy.update(() => copy.head(console.log)) // 'null <Buffer 68 65 6c 6c 6f>'
  other.update(() => other.head(console.log)) // 'null <Buffer 68 65 6c 6c 6f>'
})
```

## API

### `stream = replicate(...hypercores, opts, onend)`

Replicate a variable amount of hypercores that share the same key with each
other where `opts` is passed to `hypercores[i].relicate(opts)` and
`onend` is called when all the replication streams have ended.

## License

MIT
