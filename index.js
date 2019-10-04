const ready = require('hypercore-ready')
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
  let opts = null
  let cb = null

  for (const feed of hypercores) {
    if (isHypercore(feed)) {
      if (!first) {
        first = feed
      } else if (feed !== first) {
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

  cb = once(cb)

  return ready(...feeds, onready)

  function onready(err, pend, total) {
    let prev = first
    let tail = null

    if (err) { return onerror }

    for (const feed of feeds) {
      const replica = replicatePair(first, feed, opts, onend)

      prev = feed

      missing++
      pending.add(replica)
    }

    for (const stream of streams) {
      if (prev) {
        const from = replicateCore(first, false, clone(opts))
        tail = pump(stream, from, stream, onend)
      } else if (tail) {
        tail = pump(stream, tail, stream, onend)
      }

      if (tail) {
        missing++
        pending.add(tail)
      } else {
        tail = stream
      }
    }
  }

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

function replicateCore(core, ...args) {
  return core.replicate(...args)
}

function isHypercore(value) {
  return value && 'object' === typeof value && 'function' === typeof value.replicate
}

function replicatePair(first, second, opts, cb) {
  if ('noiseKeyPair' in first) {
    const stream = replicateCore(first, false, clone(opts))
    return pump(stream, replicateCore(second, true, clone(opts)), stream, cb)
  } else {
    const stream = replicateCore(first, clone(opts))
    return pump(stream, replicateCore(second, clone(opts)), stream, cb)
  }
}

module.exports = replicate
