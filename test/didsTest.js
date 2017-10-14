const Initialize = require('../lib/initialize')
const ulid = require('ulid')
const test = require('ava')
const Dids = require('../lib/models/dids.js')
const Factory = require('../helpers/factory')

/*
|--------------------------------------------------------------------------
| Get Tests
|--------------------------------------------------------------------------
|
|
*/

test('testGet', async t => {
  const testDids = await t.context.factory.dids(4)

  const dids = new Dids(t.context.db)
  let results = await dids.get()

  t.is(results.data.length, 4)
})

/*
|--------------------------------------------------------------------------
| Filter Tests
|--------------------------------------------------------------------------
|
|
*/

test('testFind', async t => {
  t.is(1, 1)
})

/*
|--------------------------------------------------------------------------
| Pagination Tests
|--------------------------------------------------------------------------
|
|
*/

test('testGetMore', async t => {
  await t.context.factory.dids(45)
  const dids = await new Dids(t.context.db)

  // load page 1
  await dids.get()
  t.is(dids.data.length, 20)
  t.is(dids.data[0]._data.text, 'Did 0')
  t.is(dids.data[19]._data.text, 'Did 19')
  t.is(dids.pagination.count, 20)

  // load page 2
  await dids.more()
  t.is(dids.data.length, 40)
  t.is(dids.data[0]._data.text, 'Did 0')
  t.is(dids.data[39]._data.text, 'Did 39')
  t.is(dids.pagination.count, 40)

  // load last page
  await dids.more()
  t.is(dids.data.length, 45)
  t.is(dids.data[0]._data.text, 'Did 0')
  t.is(dids.data[44]._data.text, 'Did 44')
  t.is(dids.pagination.count, 45)
  t.is(dids.pagination.next, null)
})

test('testGetAll', async t => {
  await t.context.factory.dids(45)
  const dids = await new Dids(t.context.db)

  // load page 1
  await dids.all()
  t.is(dids.data.length, 45)
  t.is(dids.data[0]._data.text, 'Did 0')
  t.is(dids.data[44]._data.text, 'Did 44')
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
