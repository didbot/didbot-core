'use strict'

const test = require('ava')
const User = require('../lib/user')
require('dotenv').config()

test.serial('Test get access token', async t => {
  let user = new User()
  await user.login('a@a.com', '123')

  t.truthy(user.authenticated)
  t.is(user.name, 'John Smith')
  t.is(user.email, 'a@a.com')
  t.is(user.id, 'c8df99a0-0562-11e7-9082-bfd7aa3311e8')
  t.truthy(user.token)

  // test saving and restoring the user session
  let session = user.get()
  let user2 = new User()
  t.falsy(user2.authenticated)

  await user2.set(session)
  t.truthy(user2.authenticated)
  t.is(user2.name, 'John Smith')
  t.is(user2.email, 'a@a.com')
  t.is(user2.id, 'c8df99a0-0562-11e7-9082-bfd7aa3311e8')
  t.truthy(user.token)
})
