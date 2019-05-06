const hypercore = require('hypercore')
const replicate = require('./')
const ram = require('random-access-memory')

const feed = hypercore(ram)
feed.ready(() => {
  const copy = hypercore(ram, feed.key)
  replicate(feed, copy, copy2, { live: true })
  feed.append('hello')
  copy.update(() => {
    copy.head(console.log)
  })
})
