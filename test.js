const hypercore = require('hypercore')
const replicate = require('./')
const test = require('tape')
const ram = require('random-access-memory')

test('replicate(a, b) - feed pair', (t) => {
  const message = Buffer.from('message')
  const a = hypercore(ram)
  a.append(message)
  a.ready(() => {
    const b = hypercore(ram, a.key)
    replicate(a, b, (err) => {
      t.ok(null === err, 'callback called without error')
      b.head((err, buf) => {
        t.ok(0 === Buffer.compare(message, buf), 'a replicates into b')
        t.end()
      })
    })
  })
})

test('replicate(a, b, c) - feed 3-tuple', (t) => {
  const message = Buffer.from('message')
  const a = hypercore(ram)
  a.append(message)
  a.ready(() => {
    const b = hypercore(ram, a.key)
    const c = hypercore(ram, a.key)
    replicate(a, b, c, (err) => {
      t.ok(null === err, 'callback called without error')
      b.head((err, buf) => {
        t.ok(0 === Buffer.compare(message, buf), 'a replicates into b')
      })
      c.head((err, buf) => {
        t.ok(0 === Buffer.compare(message, buf), 'a replicates into c')
        t.end()
      })
    })
  })
})

test('replicate(a, b, stream) - feed pair with stream', (t) => {
  const message = Buffer.from('message')
  const a = hypercore(ram)
  a.append(message)
  a.ready(() => {
    const b = hypercore(ram, a.key)
    const c = hypercore(ram, a.key)
    replicate(a, b, c.replicate(), (err) => {
      t.ok(null === err, 'callback called without error')
      b.head((err, buf) => {
        t.ok(0 === Buffer.compare(message, buf), 'a replicates into b')
      })
      c.head((err, buf) => {
        t.ok(0 === Buffer.compare(message, buf), 'a replicates into c')
        t.end()
      })
    })
  })
})

test('replicate(a, b) - stream pair', (t) => {
  const message = Buffer.from('message')
  const a = hypercore(ram)
  a.append(message)
  a.ready(() => {
    const b = hypercore(ram, a.key)
    replicate(a.replicate(), b.replicate(), (err) => {
      t.ok(null === err, 'callback called without error')
      b.head((err, buf) => {
        t.ok(0 === Buffer.compare(message, buf), 'a replicates into b')
        t.end()
      })
    })
  })
})

test('replicate(a, b, c) - single feed with stream pair', (t) => {
  const message = Buffer.from('message')
  const a = hypercore(ram)
  a.append(message)
  a.ready(() => {
    const b = hypercore(ram, a.key)
    const c = hypercore(ram, a.key)
    replicate(a, b.replicate(), c.replicate(), (err) => {
      t.ok(null === err, 'callback called without error')
      b.head((err, buf) => {
        t.ok(0 === Buffer.compare(message, buf), 'a replicates into b')
      })
      c.head((err, buf) => {
        t.ok(0 === Buffer.compare(message, buf), 'a replicates into c')
        t.end()
      })
    })
  })
})
