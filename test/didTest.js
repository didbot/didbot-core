const Initialize = require('../lib/initialize')
const ulid = require('ulid')
const test = require('ava')
const Did = require('../lib/models/did.js')
const Factory = require('../helpers/factory')

/*
|--------------------------------------------------------------------------
| Getter, Setter, & Hydrator Tests
|--------------------------------------------------------------------------
|
|
*/

test('testGettersAndSetters', async t => {
  let did = await t.context.factory.did()
  did.setText('test')
  did.setTags('test')
  did.setMeta('test')
  did.setSource('test')

  t.is(did.getTags(), 'test')
  t.is(did.getMeta(), 'test')
  t.is(did.getSource(), 'test')
})

/*
|--------------------------------------------------------------------------
| Find Tests
|--------------------------------------------------------------------------
|
|
*/

test('testFind', async t => {
  const did = await t.context.factory.did()
  let id = did.getId()
  const result = await did.find(id)
  t.is(did.getId(), result.getId())
})

test('testFindThrowsErrorIfNotFound', async t => {
  let did = await new Did(t.context.db)
  const error = await t.throws(did.find(ulid()))

  t.is(error.message, 'missing')
})

/*
|--------------------------------------------------------------------------
| Create Tests
|--------------------------------------------------------------------------
|
|
*/

test('testSave', async t => {
  let did = await t.context.factory.did()
  did.setText('test')
  did.setTags(['test'])
  did.setMeta({test: true})
  did.setSource('test')

  let result = await did.save()
  t.is(result.getSource(), 'test')
})

/*
|--------------------------------------------------------------------------
| Update Tests
|--------------------------------------------------------------------------
|
|
*/

test('testUpdate', async t => {
  const did = await t.context.factory.did()
  t.is(did.getTags().length, 1)
  const tags = ['test', 'new']
  did.setTags(tags)

  let result = await did.save()
  t.is(result.getTags().length, 2)
  t.is(result.getTags()[0], tags[0])
  t.is(result.getTags()[1], tags[1])
})

/*
|--------------------------------------------------------------------------
| Delete Tests
|--------------------------------------------------------------------------
|
|
*/

test('testDelete', async t => {
  const did = await t.context.factory.did()
  const result = await did.delete()

  t.is(true, result.ok)
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
  t.context.db =  await new Initialize(ulid(), ulid())
  t.context.factory =  await new Factory(t.context.db)
})

test.afterEach(async t => {
  try {
    await t.context.db.destroy()
  } catch (err) {
    console.log(err)
  }
})
