/**
 * Selector is passed to the pouchdb find method along with the sort and limit objects. It is hydrated
 * from the filters and pagination properties prior to each search. It is held in a separate class so
 * a new instance can be created for each search. This allows us to preserve the state of the previous
 * query in the filter object while avoiding any carryover in the params object.
 */
import * as PouchDB from 'pouchdb'
import {Filter} from './filter'
const moment = require('moment')

/**
 * The Selector class is passed directly to the PouchDB.find() method.
 */
export class Selector {
    /**
     * Set $in is set after getting id results from full text search.
     * Set $lte is cursoring through dids in reverse chronological order.
     * @var object
     */ // tslint:disable-next-line:variable-name
    public _id: {
        $in?: string[]
        $lte?: string
    }

    /**
     * Set $gte for dates greater than or equal to
     * Set $lte for dates less than or equal to
     * @var object
     */
    public date: {
        $gte?: string
        $lte?: string
    }

    /**
     * Set source to filter results by source
     * @var string
     */
    public source: string

    /**
     * Set tags to filter results by tag
     * @var string
     */
    public tags: {
        $elemMatch?: {
            $eq?: string
        }
    }

    /**
     * Set text to perform a wildcard search.
     * @var string
     */
    public text: {
        $regex?: RegExp
    }

    /**
     * Type is set to 'did' by default so as not to return other types of documents.
     * @var string
     */
    public type: string

    /**
     * Constructor
     */
    constructor() {
        this._id  = {}
        this.date = {}
        this.tags = {}
        this.text = {}
        this.type   = 'did'
    }

    /**
     * Sets the selector properties
     * @param filter Filter
     * @param db PouchDB.Database
     * @param pagination any
     * @param more boolean
     * @return Promise<void>
     */
    public async set(filter: Filter, db: PouchDB.Database,  pagination: any, more: boolean): Promise<void> {
        // set text search
        if (filter.q) { await this.setTextSearch(filter.q, db) }

        // set from and to to the beginning of the day and the end of the day respectively
        if (filter.from) { this.date.$gte = moment(filter.from).startOf('day').toJSON() }
        if (filter.to) { this.date.$lte = moment(filter.to).endOf('day').toJSON() }

        // set tag and source
        if (filter.tag) { this.tags = { $elemMatch: { $eq: filter.tag}} }
        if (filter.source) { this.source = filter.source }

        // Using lte here because we want to get limit + 1 results back so we know if there are more pages.
        if (more) { this._id.$lte   = pagination.next }
    }

    /**
     * Sets either a basic regex search on the text property or returns the IDs matching a full text search.
     * @param q string
     * @param db PouchDB.Database
     * @return void
     */
    private async setTextSearch(q: string, db: PouchDB.Database): Promise<void> {
        if (this.isMultipleWordQuery(q)) {

            // get ids for the full text search match
            this._id.$in = await this.getDidsUsingFullTextSearch(q, db)

        } else {

            // otherwise just do a case insensitive wildcard search against the text
            this.text.$regex = new RegExp(q, 'i')

        }
    }

    /**
     * Determines whether the query contains more then one word.
     * @param q string
     * @return boolean
     */
    private isMultipleWordQuery(q: string): boolean {
        return /\s/.test(q)
    }

    /**
     * Performs a full text search for the given q. Returns an array of did ids.
     * @param q string
     * @param db PouchDB.Database
     * @return array
     */
     private async getDidsUsingFullTextSearch(q: string, db: PouchDB.Database): Promise<string[]> {
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
