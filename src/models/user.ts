import Axios from 'axios'
import PouchDB from 'pouchdb'
import {UserData} from './userData'

export class User {
    public data: UserData
    public authenticated: boolean
    private db: PouchDB.Database

    public setDb(db: PouchDB.Database) {
        this.db = db
    }

    public getDb(): PouchDB.Database {
        return this.db
    }

    public async login(email: string, password: string, source: string) {
        try {
            const server = process.env.AUTH_SERVER
            const response = await Axios.post(server + '/jwt', {
                // grant_type: 'password',
                // client_id: process.env.CLIENT_ID,
                // client_secret: process.env.CLIENT_SECRET,
                email,
                password
                // scope: ''
            })

            this.data.source = source
            this.data.token = response.data.token
            await this.getUserInfo()
        } catch (err) {
            this.authenticated = false
            throw (err)
        }
    }

    /**
     * Using getters and setters so session can be managed outside of the package.
     * We don't want to use pouch to manage session or we'll have to use filtered
     * replication.
     */
    public get(): UserData {
        return this.data
    }

    /**
     * Setting validateToken = false will bypass token verification with the server. This
     * is useful for testing or in local only copies of the app.
     */
    public async set(data: UserData, validateToken: boolean = true): Promise <boolean> {
        this.data = data

        if (validateToken) {
            this.authenticated = false
            await this.getUserInfo()
        } else {
            this.authenticated = true
        }

        return true
    }

    public async getUserInfo(): Promise <boolean> {
        try {
            const result = await Axios.get(process.env.AUTH_SERVER + '/openid/userinfo', {
                headers: { Authorization: 'Bearer ' + this.data.token }
            })

            this.data.id = result.data.id
            this.data.name = result.data.name
            this.data.email = result.data.email
            this.authenticated = true
            return true

        } catch (err) {
            this.authenticated = false
            throw (err)
        }
    }
}
