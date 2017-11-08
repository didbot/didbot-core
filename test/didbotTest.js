const Initialize = require('../lib/initialize')
const Didbot = require('../lib/didbot')
const ULID = require('ulid')
const test = require('ava')
const User = require('../lib/models/user.js')
const Factory = require('../helpers/factory')

/*
|--------------------------------------------------------------------------
| Tests
|--------------------------------------------------------------------------
|
|
*/

test('testDids', async t => {
  await t.context.factory.dids(4)
  await t.context.didbot.login()

  let results = await t.context.didbot.dids.get()
  t.is(results.data.length, 4)
})

test('testDid', async t => {
  await t.context.didbot.login()
  let did = await t.context.didbot.did
  did.setText('test')
  did.setTags(['test'])
  did.setMeta({test: true})
  did.setSource('test')

  let result = await did.save()
  t.is(result.getSource(), 'test')
})

/*
|--------------------------------------------------------------------------
| Test Helpers
|--------------------------------------------------------------------------
|
|
*/

test.beforeEach(async t => {
  // generate a random db
  const userId = ULID.ulid()
  const user = new User()
  user.id = userId
  t.context.db =  await new Initialize(user)
  t.context.factory =  await new Factory(t.context.db)

  // create a didbot instance
  t.context.didbot =  await new Didbot()

  // override the user.login function
  t.context.didbot.user.login = function () {
    this.id = userId
    this.name = 'Testy McTesty'
    this.email = 'test@test.com'
    this.authenticated = true
  }
})

test.afterEach(async t => {
  try {
    await t.context.db.destroy()
  } catch (err) {
    console.log(err)
  }
})
