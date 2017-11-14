import PouchDB from 'pouchdb'
import {Initialize} from './initialize'
import {Did} from './models/did'
import {Dids} from './models/dids'
import {Sources} from './models/sources'
import {Tags} from './models/tags'
import {User} from './models/user'

export class Didbot {
    public user: User
    public did: Did
    public dids: Dids
    public tags: Tags
    public sources: Sources
    private db: PouchDB.Database

    constructor() {
        this.user = new User()
    }

    public async login(email: string, password: string, source: string): Promise <void> {
        try {
            await this.user.login(email, password, source)
            await this.start()
        } catch (err) {
            this.user.authenticated = false
            throw (err)
        }
    }

    public async start(): Promise <void> {
        if (!this.user.authenticated) {
            throw (new Error('Didbot cannot start without an authenticated user'))
        }

        try {
                const i       = new Initialize()
                this.db       = i.open(this.user.data.id)
                this.user.setDb(this.db)

                this.tags     = await new Tags(this.db)
                this.sources  = await new Sources(this.db)
                this.did      = new Did(this.user)
                this.dids     = new Dids(this.user)
        } catch (err) {
            this.user.authenticated = false
            throw (err)
        }
    }

}
