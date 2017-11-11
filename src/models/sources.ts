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

  public get() {
    return (async () => {
      try {
        return await this.db.query('my_index/sources', {reduce: true, group: true})
      } catch (err) {
        throw (err)
      }
    })()
  }
}
