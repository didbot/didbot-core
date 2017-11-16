import PouchDB from 'pouchdb'

/**
 * Handles working with a collection of Sources
 */
export class Sources {
    /**
     * @var PouchDB.Database
     */
    private db: PouchDB.Database

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
     * Gets all sources from the database along with their number of occurrences.
     */
    public async get(): Promise<any> {
        try {

            // Get all sources from the sources index
            const result = await this.db.query('my_index/sources', {
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
