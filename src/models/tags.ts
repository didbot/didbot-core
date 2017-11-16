import PouchDB from 'pouchdb'

/**
 * Handles working with a collection of Tags
 */
export class Tags {

    /**
     *
     */
    private db: PouchDB.Database

    /**
     *
     */
    private data: string[]

    /**
     *
     */
    constructor(db: PouchDB.Database) {
        this.db   = db
    }

    /*
    |--------------------------------------------------------------------------
    | Methods
    |--------------------------------------------------------------------------
    |
    |
    */

    /**
     * Gets all tags from the database along with their number of occurrences.
     */
    public async get(): Promise<any> {
        try {

            // Get all tags and counts tags from our tags index
            const result = await this.db.query('my_index/tags', {
                group: true, reduce: true
            })

            interface I {value: string, key: string}
            const rows = result.rows

            // convert array of key:value objects to a flat object
            return Object.assign({}, ...rows.map((d: I) => ({[d.key]: d.value})))
        } catch (err) {
            console.log(err)
            throw (err)
        }
    }
}
