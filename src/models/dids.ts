import {Did} from './did'
import {Filter} from './filter'
import {Page} from './page'
import {Selector} from './selector'
import {User} from './user'

/**
 * Handles working with a collection of dids particularly pagination.
 * See https://pouchdb.com/2014/04/14/pagination-strategies-with-pouchdb.html
 */
export class Dids {
    /**
     * Holds the collection of did objects.
     */
    public data: Did[]

    /**
     * Holds the collection's summary
     */
    public summary: any

    /**
     * Filters holds the user accessible filter properties. Filters will be interpreted into the params object by this
     * class prior to each search.
     */
    public filter: Filter

    /**
     * Pagination holds the current pagination state of the collection. It is hydrated by this class after each search.
     */
    public pagination: Page

    /**
     * Holds the user object.
     */
    private user: User

    /**
     * Set to true when the user has requested all dids matching the given filters.
     */
    private requestedAll: boolean

    /**
     * Set to true when the user has requested more dids matching the given filters.
     */
    private requestedMore: boolean

    /**
     * Params is the object passed to the pouchdb find method. It is hydrated by this class from the filters and
     * pagination properties prior to each search.
     */
    private params: {
        limit: number | undefined,
        selector: Selector,
        sort: Array<{}>,
    }

    /**
     * Holds the PouchDB Database
     */
    private db: PouchDB.Database

    constructor(user: User) {
        this.user = user
        this.db = user.getDb()
        this.data = []
        this.filter = new Filter()
        this.pagination = new Page()
        this.requestedAll = false
        this.requestedMore = false
        this.params = {
            limit: undefined,
            selector: new Selector(),
            sort: [{_id: 'desc'}]
        }
    }

    /*
    |--------------------------------------------------------------------------
    | CRUD Methods
    |--------------------------------------------------------------------------
    |
    |
    */

    /**
     * Obtain a collection of dids
     */
    public async get(): Promise<Dids> {
        try {

            // create a new instance of the selector specific to this search and hydrate it
            this.params.selector = new Selector()
            await this.params.selector.set(this.filter, this.db, this.pagination, this.requestedMore)

            // determine whether all dids have been requested
            if (this.requestedAll) {
                this.params.limit = undefined
            } else {
                this.params.limit = this.pagination.limit + 1
            }

            // perform the search
            const results = await this.db.find(this.params)

            // set next key
            this._setNext(results.docs)

            // hydrate the results as did objects
            this.data = this._setDids(results.docs)
            this.summary = this._setSummary(results.docs)

            this.pagination.count = this.data.length

            // and return
            return this

        } catch (err) {
            throw (err)
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Pagination Methods
    |--------------------------------------------------------------------------
    |
    |
    */

    public async all(): Promise<Dids> {
        try {

            // unset limit
            this.requestedAll = true
            const limit = this.pagination.limit

            // make request
            await this.get()

            // reset limit
            this.pagination.limit = limit
            this.requestedAll = false

            return this

        } catch (err) {
            this.requestedAll = false
            console.log(err)
            throw err
        }
    }

    public async more(): Promise<Dids> {
        try {
            if (!this.pagination.next) { throw new Error('There are no more dids to load') }
            this.requestedMore = true
            await this.get()
            this.requestedMore = false
            return this

        } catch (err) {
            this.requestedMore = false
            console.log(err)
            throw err
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Dids Object Setters
    |--------------------------------------------------------------------------
    |
    |
    */

    /**
     * For pagination we'll be using the pageSize + 1 strategy.
     */
    public _setNext(docs: any): any {
        // if the number of docs don't equal the limit there are no more docs to load
        if (docs.length !== this.params.limit || this.requestedAll) {
            this.pagination.next = ''
            return
        }

        // otherwise we know there's at least one more doc
        this.pagination.next = docs.pop()._id
        return docs
    }

    public _setDids(results: any): Did[] {

        const dids = (this.requestedMore) ? this.data : []

        for (const result of results) {
            const did = new Did(this.user)
            did.hydrate(result)
            dids.push(did)
        }

        return dids
    }

    public _setSummary(results: any) {

        const meta = []
        for (const result of results) {
            meta.push(result.meta)
        }

        const keys = this._getUniqueKeys(meta)
        const items = this._getSummaryObject(keys, meta)

        // set count and sum
        for (const key of keys) {
            items[key].count = items[key].values.length
            items[key].sum = items[key].values.reduce((a: any, b: any) => {
                return typeof b === 'number' ? a + b : a
            }, 0)
        }

        return items
    }

    /*
    |--------------------------------------------------------------------------
    | Public Methods
    |--------------------------------------------------------------------------
    |
    |
    */

    /**
     * Returns the total number of documents of the type did
     * @async
     * @return integer
     */
    public async totalDids(): Promise<number> {
        try {
            // index defined in initialize.js
            const result = await this.db.query('my_index/dids', {limit: 0, reduce: true, group: true})

            return result.total_rows
        } catch (err) {
            console.log(err)
            throw err
        }
    }

    /**
     * Returns the current data object as a json string
     * @return string
     */
    public json(): string {
        return JSON.stringify(this.data)
    }

    /**
     * Returns the current data object as a csv string
     * @return string
     */
    public csv() {
        //
    }

    /*
    |--------------------------------------------------------------------------
    | Private Methods
    |--------------------------------------------------------------------------
    |
    |
    */

    /**
     * Returns an array of unique keys
     *  From: [{apples: 2, bananas: 5},{bananas: 1, oranges: 3}]
     *  To: ['apples', 'bananas, 'oranges']
     * @param array Array of Objects
     * @return Array
     */
    private _getUniqueKeys(array: any[]) {
        return Object.keys(Object.assign({}, ...array))
    }

    /**
     * Converts an array of objects into a single object
     *  From: [
     *    {apples: 2, bananas: 5},
     *    {bananas: 1, oranges: 3}
     *  ]
     *  To: {
     *    apples:  {values: [2]}
     *    bananas: {values: [5,1]}
     *    oranges: {values: [3]}
     *  }
     * @param keys Array
     * @param array Array of Objects
     * @return Objecty
     */
    private _getSummaryObject(keys: string[], array: any[]) {
        const sum = Object.assign({}, ...keys.map((key) => {

            // get the value of each object
            const val = array.map((item) => item[key]).filter((item) => item)

            // create a property named after each key
            const obj: any = {}
            obj[key] = {values: val}

            return obj
        }))

        return sum
    }

}
