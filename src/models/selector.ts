/**
 * Selector is passed to the pouchdb find method along with the sort and limit objects. It is hydrated
 * from the filters and pagination properties prior to each search. It is held in a separate class so
 * a new instance can be created for each search. This allows us to preserve the state of the previous
 * query in the filter object while avoiding any carryover in the params object.
 */
import * as PouchDB from 'pouchdb'
import {Filter} from './filter'

export class Selector {
    // tslint:disable-next-line:variable-name
    public _id: any
    public date: any
    public source: string
    public tags: any
    public text: any
    public type: string

    constructor() {
        this._id  = {}
        this.date = {}
        this.tags = {}
        this.text = {}
        this.type   = 'did'
    }

    public async set(filter: Filter, db: PouchDB.Database,  pagination: any, more: boolean) {
        // set text search
        if (filter.q) { await this.setTextSearch(filter.q, db) }

        // set from and to
        if (filter.from) { this.date.$gte = filter.from }
        if (filter.to) { this.date.$lte = filter.to }

        // set tag and source
        if (filter.tag) { this.tags.$elemMatch.$eq = filter.tag }
        if (filter.source) { this.source = filter.source }

        // Using lte here because we want to get limit + 1 results back so we know if there are more pages.
        if (more) { this._id.$lte   = pagination.next }
    }

    /**
     * Handles the text search
     */
    private async setTextSearch(q: string, db: PouchDB.Database) {
        if (this.isMultipleWordQuery(q)) {

            // get ids for the full text search match
            this._id.$in = await this.getDidsUsingFullTextSearch(q, db)

        } else {

            // otherwise just do a case insensitive wildcard search against the text
            this.text.$regex = new RegExp(q, 'i')

        }
    }

    /**
     * Determines whether the query contains more then one word. If so full text search will be used.
     * @return boolean
     */
    private isMultipleWordQuery(query: string) {
        return (query && /\s/g.test(query))
    }

    /**
     * Performs a full text search for the given q. Returns an array of did ids.
     * @return array
     */
     private async getDidsUsingFullTextSearch(q: string, db: PouchDB.Database) {
        try {

            const qDocs = await db.search({
                fields: ['text'],
                query: q
            })

            return qDocs.rows.map((row: any) => {
                return row.id
            })

        } catch (err) {
            throw (err)
        }
    }
}
