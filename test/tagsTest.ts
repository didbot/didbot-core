import test from 'ava'
import {ulid} from 'ulid'
import {Factory} from '../src/factory'
import {Initialize} from '../src/initialize'
import {Dids} from '../src/models/dids'
import {Tags} from '../src/models/tags'
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

test('testTagsGet', async (t) => {
    await t.context.factory.dids(3)
    const d = new Dids(t.context.user)
    await d.get()
    t.is(d.data.length, 3)

    d.data[0].setTags(['apple'])
    d.data[1].setTags(['banana', 'apple'])
    d.data[2].setTags(['orange', 'banana'])
    await d.data[0].save()
    await d.data[1].save()
    await d.data[2].save()

    const tags = new Tags(t.context.db)
    const result = await tags.get()
    t.deepEqual(result, {apple: 2, banana: 2, orange: 1})
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
