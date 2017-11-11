const ULID = require('ulid')
const validate = require('../helpers/design')
import * as Moment from 'moment'
import {User} from './user'

export class Did {

    public id: string
    private db: PouchDB.Database
    private user: User
    private data: {
        _id: string
        _rev: string
        type: string
        user: string
        date: any
        text: string
        source: string
        tags: string[]
        meta: object
    }

    constructor(user: User) {
        this.db     = user.getDb()
        this.user   = user
        this.data   = {
            _id: '',
            _rev: '',
            date: '',
            meta: {},
            source: '',
            tags: [],
            text: '',
            type: 'did',
            user: user.data.id
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Getters
    |--------------------------------------------------------------------------
    |
    |
    */

    /**
     * @return object
     */
    public getData() {
        return this.data
    }

    /**
     * @return string
     */
    public getType() {
        return this.data.type
    }

    /**
     * @return ulid
     */
    public getId() {
        return this.data._id
    }

    /**
     * @return moment object
     */
    public getDate() {
        return this.data.date
    }

    /**
     * @return string
     */
    public getText() {
        return this.data.text
    }

    /**
     * @return array
     */
    public getTags() {
        return this.data.tags
    }

    /**
     * @return ulid
     */
    public getUser() {
        return this.data.user
    }

    /**
     * @return array
     */
    public getMeta() {
        return this.data.meta
    }

    /**
     * @return string
     */
    public getSource() {
        return this.data.source
    }

    /*
    |--------------------------------------------------------------------------
    | Setters
    |--------------------------------------------------------------------------
    |
    |
    */

    /**
     * @param text string
     */
    public setText(text: string) {
        this.data.text = text
    }

    /**
     * @param tags array
     */
    public setTags(tags: string[]) {
        this.data.tags = tags
    }

    /**
     * @param meta array
     */
    public setMeta(meta: object) {
        this.data.meta = meta
    }

    /**
     * @param string array
     */
    public setSource(source: string) {
        this.data.source = source
    }

    /*
    |--------------------------------------------------------------------------
    | CRUD Methods
    |--------------------------------------------------------------------------
    |
    |
    */

    /**
     * Returns a single did by id
     */
    public find(id: string): Promise<Did> {
        return (async () => {
            try {

                const result = await this.db.get(id)

                // return a new instance of self
                const did = new Did(this.user)
                did.hydrate(result)
                return did

            } catch (err) {
                throw (err)
            }
        })()
    }

    /**
     * Saves or updates a did. Note that the following properties cannot be modified
     * once set: id, user, type, source, date
     */
    public save(): Promise<Did> {
        return (async () => {
            try {

                if (this.data._rev) {
                    await this._prepForUpdate()
                } else {
                    this._prepForInsert()
                }

                const result = await this.db.put(this.data)
                return this.find(result.id)

            } catch (err) {
                throw (err)
            }
        })()
    }

    /**
     * Deletes a did
     */
    public async destroy(): Promise<object> {
        try {
            return await this.db.remove(this.data._id, this.data._rev)
        } catch (err) {
            throw (err)
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Other Methods
    |--------------------------------------------------------------------------
    |
    |
    */

    /**
     * Prepare the model for an insert
     */
    public _prepForInsert() {
        this.data._id = ULID.ulid()
        this.data.date = new Date().toJSON()
        this.data.user = this.user.data.id
        this.data.type = 'did'
        validate(this.data, null)
    }

    /**
     * Prepare the model for an update
     */
    public async _prepForUpdate() {
        const oldDid = await this.find(this.data._id)
        this.data.user   = oldDid.data.user
        this.data.type   = oldDid.data.type
        this.data.date   = oldDid.data.date.toJSON()
        this.data.source = oldDid.data.source
        validate(this.data, oldDid.data)
    }

    /**
     * Hydrates a did from the given object
     */
    public hydrate(input: any) {
        this.id = input._id
        this.data._id  = input._id
        this.data._rev = input._rev
        this.data.date = Moment(input.date)
        this.data.user = input.user
        this.data.type = input.type

        this.setText(input.text)
        this.setTags(input.tags)
        this.setMeta(input.meta)
        this.setSource(input.source)
    }

}