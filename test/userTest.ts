import test from 'ava'
import {ulid} from 'ulid'
import {User} from '../src/models/user'
import {UserData} from '../src/models/userData'

test('Test get access token', async (t) => {
    await t.context.user.login('a@a.com', '123')

    t.truthy(t.context.user.data.id)
    t.is(t.context.user.data.email, 'test@test.com')
    t.is(t.context.user.data.name, 'Testy McTesty')
    t.is(t.context.user.data.token, 'SOME_TOKEN')

    // test restoring the user session
    const session = t.context.user.get()
    t.truthy(session.id)
    t.is(session.email, 'test@test.com')
    t.is(session.name, 'Testy McTesty')
    t.is(session.token, 'SOME_TOKEN')

    // restore session
    const user2 = new User()
    t.falsy(user2.authenticated)
    user2.getUserInfo = async (): Promise<boolean> => {
        this.authenticated = true
        return true
    }
    await user2.set(session)

})

test.beforeEach(async (t) => {
    t.context.user =  await new User()
    const ud = new UserData(
        ulid(),
        'test@test.com',
        'Testy McTesty',
        'SOME_TOKEN'
    )

    // override the user.login function
    t.context.user.login = async () => {
        this.authenticated = true
        await t.context.user.set(ud)
    }

    t.context.user.getUserInfo = async () => {
        this.authenticated = true
    }
})
