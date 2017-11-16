import test from 'ava'
import {ulid} from 'ulid'
import {Factory} from '../src/factory'
import {Initialize} from '../src/initialize'
import {Dids} from '../src/models/dids'
import {Sources} from '../src/models/sources'
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

test('testSourcesGet', async (t) => {
    await t.context.factory.dids(3)
    const d = new Dids(t.context.user)
    await d.get()
    t.is(d.data.length, 3)

    // need to set sources directly on the db
    const d1 = await t.context.db.get(d.data[0].id)
    const d2 = await t.context.db.get(d.data[1].id)
    const d3 = await t.context.db.get(d.data[2].id)

    d1.source = 'source-a'
    d2.source = 'source-a'
    d3.source = 'source-b'

    await t.context.db.put(d1)
    await t.context.db.put(d2)
    await t.context.db.put(d3)

    const sources = new Sources(t.context.db)
    const result = await sources.get()
    t.deepEqual(result, {'source-a': 2, 'source-b': 1})
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
