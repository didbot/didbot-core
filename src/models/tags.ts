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

  public get(): Promise<PouchDB.Query.Response<{}>> {
    return (async () => {
      try {
        return await this.db.query('my_index/tags', {reduce: true, group: true})
      } catch (err) {
        throw (err)
      }
    })()
  }
}
