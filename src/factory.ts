import * as moment from 'moment'
import {ulid} from 'ulid'
import {Did} from './models/did'
import {User} from './models/user'

const validate = require('./helpers/design')

export class Factory {
    private db: PouchDB.Database
    private user: User

    constructor(user: User) {
        this.db = user.getDb()
        this.user = user
    }

    /**
     * Creates did objects given in the count and persists them to the database. Returns a simple array of those
     * did objects.
     *
     * @param count integer
     * @return array
     */
    public async dids(count: number): Promise<Did[]> {
        try {
            const model = new Did(this.user)
            const dids = []

            for (let i = 0; i < count; i++) {
                const date = moment().subtract(i, 'days')

                const data = {
                    _id:    ulid(date.valueOf()),
                    date:   date.toJSON(),
                    meta:   {test: true},
                    source: 'test',
                    tags:   ['test'],
                    text:   'Did ' + i,
                    type:   'did',
                    user:   ulid()
                }

                validate(data, null)

                const result  = await this.db.put(data)
                const did     = await model.find(result.id)
                dids.push(did)
            }
            return dids
        } catch (err) {
            console.log(err)
            throw err
        }
    }

    public async did(): Promise<Did> {
        try {
            const model = new Did(this.user)
            const date = moment()

            const data = {
                _id:    ulid(date.valueOf()),
                date:   date.toJSON(),
                meta:   {test: true},
                source: 'test',
                tags:   ['test'],
                text:   'Did',
                type:   'did',
                user:   ulid()
            }

            validate(data, null)

            const result  = await this.db.put(data)
            const did     = await model.find(result.id)

            return did
        } catch (err) {
            console.log(err)
            throw err
        }
    }
}
