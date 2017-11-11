import {Did} from './did'
import {Filter} from './filter'
import {Page} from './page'
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
        selector: {
            _id: any,
            date: any,
            source: any,
            tags: object,
            text: object,
            type: string
        },
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
            limit:      0,
            selector: {
                _id:    {},
                date:   {},
                source: {},
                tags:   {},
                text:   {},
                type:   'did',
            },
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

            // hydrate the selector
            await this._setSelector()

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

    public async _setSelector() {
        try {

            const s = this.params.selector

            if (this._isMultipleWordQuery(this.filter.q)) {
                // get ids for the full text search match
                const ids = await this._getDidsUsingFullTextSearch(this.filter.q)

                s._id.$in = ids

            } else {

                // otherwise just do a case insensitive wildcard search against the text
                const regexp = new RegExp(this.filter.q, 'i')
                s.text = {
                    $regex: regexp
                }

            }

            // set from and to
            if (this.filter.from) { s.date.$gte = this.filter.from }
            if (this.filter.to) { s.date.$lte = this.filter.to }

            // set tag and source
            if (this.filter.tag) { s.tags = {$elemMatch: {$eq: this.filter.tag}} }
            if (this.filter.source) { s.source = this.filter.source }

            // Using lte here because we want to get limit + 1 results back so we know if there are more pages.
            if (this.requestedMore) {
                s._id.$lte   = this.pagination.next
            }

        } catch (err) {
            throw (err)
        }
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

    /**
     * Determines whether the query contains more then one word. If so full text search will be used.
     * @return boolean
     */
    private _isMultipleWordQuery(query: string) {
        if (query && /\s/g.test(query)) {
            return true
        }

        return false
    }

    /**
     * Performs a full text search for the given q. Returns an array of did ids.
     * @return array
     */
    private _getDidsUsingFullTextSearch(q: string) {
        return (async () => {
            try {

                const qDocs = await this.db.search({
                    fields: ['text'],
                    query: q
                })

                const ids = qDocs.rows.map((row: any) => {
                    return row.id
                })

                return ids

            } catch (err) {
                throw (err)
            }

        })()
    }

}
