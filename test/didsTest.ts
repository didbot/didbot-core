import test from 'ava'
import {ulid} from 'ulid'
import {Factory} from '../src/factory'
import {Initialize} from '../src/initialize'
import {Dids} from '../src/models/dids'
import {User} from '../src/models/user'
import {UserData} from '../src/models/userData'

const moment = require('moment')

/*
|--------------------------------------------------------------------------
| Get Tests
|--------------------------------------------------------------------------
|
|
*/

test('testGet', async (t) => {
    const testDids = await t.context.factory.dids(4)

    const dids = new Dids(t.context.user)
    const results = await dids.get()

    t.is(results.data.length, 4)
})

/*
|--------------------------------------------------------------------------
| Filter Tests
|--------------------------------------------------------------------------
|
|
*/

test('testTextFilter', async (t) => {
    await t.context.factory.dids(3)
    const dids = new Dids(t.context.user)
    let d = await dids.get()
    t.is(d.data.length, 3)

    d.data[0].setText('Apple')
    await d.data[0].save()
    d.data[1].setText('Banana')
    await d.data[1].save()
    d.data[2].setText('Oranges are a delicious fruit')
    await d.data[2].save()

    // test case insensitive partial search for single word
    d.filter.q = 'ba'
    await dids.get()
    t.is(d.data.length, 1)

    // test full text search when multiple words
    d.filter.q = 'orange fruit'
    d = await dids.get()
    t.is(d.data.length, 1)

    // test full text search must match all words
    d.filter.q = 'blue fruit'
    d = await dids.get()
    t.is(d.data.length, 0)
})

test('testTagFilter', async (t) => {
    await t.context.factory.dids(3)
    const d = new Dids(t.context.user)
    await d.get()
    t.is(d.data.length, 3)

    // need to set dates directly on the db
    d.data[0].setTags(['apple'])
    d.data[1].setTags(['banana', 'apple'])
    d.data[2].setTags(['orange', 'banana'])
    await d.data[0].save()
    await d.data[1].save()
    await d.data[2].save()

    d.filter.tag = 'banana'
    await d.get()
    t.is(d.data.length, 2)

    d.filter.tag = 'orange'
    await d.get()
    t.is(d.data.length, 1)

    d.filter.tag = null
    await d.get()
    t.is(d.data.length, 3)
})

test('testDateFilter', async (t) => {
    await t.context.factory.dids(3)
    const d = new Dids(t.context.user)
    await d.get()
    t.is(d.data.length, 3)

    // need to set dates directly on the db
    const d1 = await t.context.db.get(d.data[0].id)
    const d2 = await t.context.db.get(d.data[1].id)
    const d3 = await t.context.db.get(d.data[2].id)

    d1.date = moment('2017-12-25').toJSON()
    d2.date = moment('2017-12-24').toJSON()
    d3.date = moment('2017-12-23').toJSON()

    await t.context.db.put(d1)
    await t.context.db.put(d2)
    await t.context.db.put(d3)

    d.filter.from = '2017-12-23'
    d.filter.to = '2017-12-24'
    await d.get()
    t.is(d.data.length, 2) // expect 2 results since 'from' is start-of-day and 'to' is end-of-day.

    d.filter.from = '2017-12-23'
    d.filter.to = '2017-12-23'
    await d.get()
    t.is(d.data.length, 1)

    d.filter.to = null
    await d.get()
    t.is(d.data.length, 3) // expect 3 results since 'from' is still 2017-12-23.

    d.filter.from = null
    d.filter.to = null
    await d.get()
    t.is(d.data.length, 3)
})

test('testSourceFilter', async (t) => {
    await t.context.factory.dids(3)
    const d = new Dids(t.context.user)
    await d.get()
    t.is(d.data.length, 3)

    // need to set dates directly on the db
    const d1 = await t.context.db.get(d.data[0].id)
    const d2 = await t.context.db.get(d.data[1].id)
    const d3 = await t.context.db.get(d.data[2].id)

    d1.source = 'source-a'
    d2.source = 'source-a'
    d3.source = 'source-b'

    await t.context.db.put(d1)
    await t.context.db.put(d2)
    await t.context.db.put(d3)

    d.filter.source = 'source-a'
    await d.get()
    t.is(d.data.length, 2)

    d.filter.source = 'source-b'
    await d.get()
    t.is(d.data.length, 1)

    d.filter.source = null
    await d.get()
    t.is(d.data.length, 3)
})

/*
|--------------------------------------------------------------------------
| Summary Tests
|--------------------------------------------------------------------------
|
|
*/

test('testSummary', async (t) => {
    const d = await t.context.factory.dids(5)
    d[0].setMeta({apples: 1})
    d[1].setMeta({apples: 1, bananas: 5})
    d[2].setMeta({bananas: 2, oranges: 7})
    d[3].setMeta({sale: true})
    d[4].setMeta({store: 'Vons'})
    await d[0].save()
    await d[1].save()
    await d[2].save()
    await d[3].save()
    await d[4].save()

    const dids = new Dids(t.context.user)
    const results = await dids.get()
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

test('testGetMore', async (t) => {
    await t.context.factory.dids(45)
    const dids = await new Dids(t.context.user)

    // load page 1
    await dids.get()
    t.is(dids.data.length, 20)
    t.is(dids.data[0].getText(), 'Did 0')
    t.is(dids.data[19].getText(), 'Did 19')
    t.is(dids.pagination.count, 20)

    // load page 2
    await dids.more()
    t.is(dids.data.length, 40)
    t.is(dids.data[0].getText(), 'Did 0')
    t.is(dids.data[39].getText(), 'Did 39')
    t.is(dids.pagination.count, 40)

    // load last page
    await dids.more()
    t.is(dids.data.length, 45)
    t.is(dids.data[0].getText(), 'Did 0')
    t.is(dids.data[44].getText(), 'Did 44')
    t.is(dids.pagination.count, 45)
    t.is(dids.pagination.next, '')
})

test('testGetAll', async (t) => {
    await t.context.factory.dids(45)
    const dids = await new Dids(t.context.user)

    // load page 1
    await dids.all()
    t.is(dids.data.length, 45)
    t.is(dids.data[0].getText(), 'Did 0')
    t.is(dids.data[44].getText(), 'Did 44')
})

/*
|--------------------------------------------------------------------------
| Test Helpers
|--------------------------------------------------------------------------
|
|
*/

test.beforeEach(async (t) => {
    // create a user with a random id
    const userData = new UserData(
        ulid(),
        'test@test.com',
        'Testy McTesty',
        'some-source',
        'SOME_TOKEN'
    )
    const user = await new User()
    user.set(userData, false)

    // open the database and set it on the user object
    const i       = new Initialize()
    const db      = i.open(userData.id)
    t.context.db  = db
    user.setDb(db)

    // finally pass the user to our factory
    t.context.factory = await new Factory(user)
    t.context.user    = user
})
