import test from 'ava'
import {Didbot} from '../src/didbot'
import {Factory} from '../src/factory'
import {Initialize} from '../src/initialize'
import {UserData} from '../src/models/userData'

import {ulid} from 'ulid'

/*
|--------------------------------------------------------------------------
| Tests
|--------------------------------------------------------------------------
|
|
*/

test('testDids', async (t) => {
    await t.context.factory.dids(4)
    const results = await t.context.didbot.dids.get()
    t.is(results.data.length, 4)
})

test('testDid', async (t) => {
    const did = t.context.didbot.did
    did.setText('test')
    did.setTags(['test'])
    did.setMeta({test: true})

    const result = await did.save()
    t.is(result.getSource(), 'some-source')
})

/*
|--------------------------------------------------------------------------
| Test Helpers
|--------------------------------------------------------------------------
|
|
*/

test.beforeEach(async (t) => {
    // generate a random db
    const userData = new UserData(
        ulid(),
        'test@test.com',
        'Testy McTesty',
        'some-source',
        'SOME_TOKEN'
    )

    // create a didbot instance
    const i  = new Initialize()
    const db = i.open(userData.id)
    const didbot = await new Didbot()
    await didbot.user.set(userData, false)
    await didbot.start()

    t.context.db = db
    t.context.didbot  = didbot
    t.context.factory = await new Factory(didbot.user)
})
