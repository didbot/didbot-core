const Initialize = require('../lib/initialize')
const ULID = require('ulid')
const test = require('ava')
const Dids = require('../lib/models/dids.js')
const User = require('../lib/models/user.js')
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

test('testParamsQ', async t => {
  await t.context.factory.dids(2)
  const dids = new Dids(t.context.db)
  let d = await dids.get()
  t.is(d.data.length, 2)

  d.data[0].setText('Apple')
  await d.data[0].save()
  d.data[1].setText('Banana')
  await d.data[1].save()

  // test case insensitive search for single word
  d.filters.q = 'ba'
  d = await dids.get()
  t.is(d.data.length, 1)
})

/*
|--------------------------------------------------------------------------
| Summary Tests
|--------------------------------------------------------------------------
|
|
*/

test('testSummary', async t => {
  let d = await t.context.factory.dids(5)
  d[0].setMeta({'apples': 1})
  d[1].setMeta({'apples': 1, 'bananas': 5})
  d[2].setMeta({'bananas': 2,'oranges': 7})
  d[3].setMeta({'sale': true})
  d[4].setMeta({'store': 'Vons'})
  await d[0].save()
  await d[1].save()
  await d[2].save()
  await d[3].save()
  await d[4].save()

  const dids = new Dids(t.context.db)
  let results = await dids.get()
  t.is(results.data.length, 5)
  t.is(results.summary.apples.count, 2)
  t.is(results.summary.apples.sum, 2)
  t.is(results.summary.bananas.count, 2)
  t.is(results.summary.bananas.sum, 7)
  t.is(results.summary.oranges.count, 1)
  t.is(results.summary.oranges.sum, 7)
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
  const user = new User()
  user.id = ULID.ulid()
  t.context.db =  await new Initialize(user)
  t.context.factory =  await new Factory(t.context.db)
})

test.afterEach(async t => {
  try {
    await t.context.db.destroy()
  } catch (err) {
    console.log(err)
  }
})
