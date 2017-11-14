import test from 'ava'
import {ulid} from 'ulid'
import {Factory} from '../src/factory'
import {Initialize} from '../src/initialize'
import {Did} from '../src/models/did'
import {User} from '../src/models/user'
import {UserData} from '../src/models/userData'

const moment = require('moment')

/*
|--------------------------------------------------------------------------
| Getter, Setter, & Hydrator Tests
|--------------------------------------------------------------------------
|
|
*/

test('testGettersAndSetters', async (t) => {
  const did = await t.context.factory.did()
  did.setText('test')
  did.setTags('test')
  did.setMeta('test')

  t.is(did.getTags(), 'test')
  t.is(did.getMeta(), 'test')
  t.is(did.getText(), 'test')
})

/*
|--------------------------------------------------------------------------
| Find Tests
|--------------------------------------------------------------------------
|
|
*/

test('testFind', async (t) => {
  const did = await t.context.factory.did()
  const id = did.getId()
  const result = await did.find(id)
  t.is(did.getId(), result.getId())
})

test('testFindThrowsErrorIfNotFound', async (t) => {
  const did = await new Did(t.context.user)
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

test('testSave', async (t) => {
    const did = await t.context.factory.did()
    did.setText('test')
    did.setTags(['test'])
    did.setMeta({test: true})

    const result = await did.save()
    t.is(result.getText(), 'test')

    const raw = await t.context.db.get(result.id)

    // validate date is in this format 2017-11-13T16:03:11.989Z
    t.regex(raw.date, new RegExp('^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d{3}Z$', 'g'))

    // validate date is within 5 seconds of now
    const now = moment()
    const date = moment(raw.date)
    t.truthy(now.diff(date) < 5000)
})

/*
|--------------------------------------------------------------------------
| Update Tests
|--------------------------------------------------------------------------
|
|
*/

test('testUpdate', async (t) => {
  const did = await t.context.factory.did()
  t.is(did.getTags().length, 1)
  const tags = ['test', 'new']
  did.setTags(tags)

  const result = await did.save()
  t.is(result.getTags().length, 2)
  t.is(result.getTags()[0], tags[0])
  t.is(result.getTags()[1], tags[1])
})

/*
|--------------------------------------------------------------------------
| Destroy Tests
|--------------------------------------------------------------------------
|
|
*/

test('testDestroy', async (t) => {
  const did = await t.context.factory.did()
  const result = await did.destroy()

  t.is(true, result.ok)
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
        'SOME_SOURCE',
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
