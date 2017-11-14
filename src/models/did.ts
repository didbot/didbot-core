import {UserData} from "./userData"

const ULID = require('ulid')
const validate = require('../helpers/design')
import { Moment } from 'moment'
import {User} from './user'

// TODO: can we fix this? https://stackoverflow.com/a/45584936
const moment = require('moment')

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
    public getData(): any {
        return this.data
    }

    /**
     * @return string
     */
    public getType(): string {
        return this.data.type
    }

    /**
     * @return ulid
     */
    public getId(): string {
        return this.data._id
    }

    /**
     * @return Moment object
     */
    public getDate(): Moment {
        return this.data.date
    }

    /**
     * @return string
     */
    public getText(): string {
        return this.data.text
    }

    /**
     * @return array
     */
    public getTags(): string[] {
        return this.data.tags
    }

    /**
     * @return ulid
     */
    public getUser(): string {
        return this.data.user
    }

    /**
     * @return array
     */
    public getMeta(): any {
        return this.data.meta
    }

    /**
     * @return string
     */
    public getSource(): string {
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
     * @param meta object
     */
    public setMeta(meta: object) {
        this.data.meta = meta
    }

    /**
     * @param source string
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
    public async  find(id: string): Promise<Did> {
        try {

            const result = await this.db.get(id)

            // return a new instance of self
            const did = new Did(this.user)
            did.hydrate(result)
            return did

        } catch (err) {
            throw (err)
        }
    }

    /**
     * Saves or updates a did. Note that the following properties cannot be modified
     * once set: id, user, type, source, date
     */
    public async save(): Promise<Did> {
        try {

            if (this.data._rev) {
                await this.prepForUpdate()
            } else {
                this.prepForInsert()
            }

            const result = await this.db.put(this.data)
            return this.find(result.id)

        } catch (err) {
            throw (err)
        }
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
    private prepForInsert() {
        this.data._id = ULID.ulid()
        this.data.date = new Date().toJSON()
        this.data.user = this.user.data.id
        this.data.type = 'did'
        validate(this.data, null)
    }

    /**
     * Prepare the model for an update
     */
    private async prepForUpdate() {
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
        this.data.date = moment(input.date)
        this.data.user = input.user
        this.data.type = input.type

        this.setText(input.text)
        this.setTags(input.tags)
        this.setMeta(input.meta)
        this.setSource(input.source)
    }

}
