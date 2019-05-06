const once = require('once')
const pump = require('pump')

const clone = (object) => Object.assign({}, object)
const noop = () => void 0

function replicate(...hypercores) {
  const pending = new Set()
  const streams = new Set()
  const feeds = new Set()

  let destroyed = false
  let missing = 0
  let first = null
  let prev = null
  let opts = null
  let cb = null

  for (const feed of hypercores) {
    if (isHypercore(feed)) {
      if (!first) {
        first = feed
      } else {
        feeds.add(feed)
      }
    } else if (feed && feed.push && feed.pipe) {
      streams.add(feed)
    } else if (!opts && feed && 'object' === typeof feed) {
      opts = clone(feed)
    } else if (!cb && 'function' === typeof feed) {
      cb = feed
      break
    }
  }

  if (!cb) {
    cb = noop
  }

  if (!opts) {
    opts = {}
  }

  prev = first
  cb = once(cb)

  for (const feed of feeds) {
    const replica = replicatePair(prev, feed, opts, onend)

    if (replica.live) {
      prev = feed
    }

    missing++
    pending.add(replica)
  }

  if (!prev) {
    prev = first
  }

  if (!prev) {
    prev = [ ...streams ][0]
    streams.delete(prev)
  }

  for (const stream of streams) {
    if (first) {
      prev = first.replicate(clone(opts))
    }

    const replica = pump(prev, stream, prev, onend)

    if (!first && replica.live) {
      prev = stream
    }

    missing++
    pending.add(replica)
  }

  return prev

  function destroy() {
    for (const entry of pending) {
      entry.destroy()
    }

    missing = 0
    pending.clear()
    streams.clear()
    feeds.clear()
  }

  function onend(err) {
    if (err) {
      onerror(err)
    } else if (0 === --missing) {
      destroy()
      cb(null)
    }
  }

  function onerror(err) {
    missing = 0
    destroy()
    cb(err)
  }
}

function isHypercore(value) {
  return value && 'object' === typeof value && value.key && value.discoveryKey
}

function replicatePair(first, second, opts, cb) {
  const stream = first.replicate(clone(opts))
  return pump(stream, second.replicate(clone(opts)), stream, cb)
}

module.exports = replicate
