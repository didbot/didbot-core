import test from 'ava'
import {ulid} from 'ulid'
import {Factory} from '../src/factory'
import {Initialize} from '../src/initialize'
import {Dids} from '../src/models/dids'
import {User} from '../src/models/user'
import {UserData} from '../src/models/userData'

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

test('testParamsQ', async (t) => {
    await t.context.factory.dids(2)
    const dids = new Dids(t.context.user)
    let d = await dids.get()
    t.is(d.data.length, 2)

    d.data[0].setText('Apple')
    await d.data[0].save()
    d.data[1].setText('Banana')
    await d.data[1].save()

    // test case insensitive search for single word
    d.filter.q = 'ba'
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
