/**
 * Handles working with a collection of Sources
 */
class Sources {
  constructor (db) {
    /**
     * @var pouchdb instance
     */
    this.db   = db

    /**
     * Holds the sources
     *
     * @var array
     */
    this._data = []
  }

  /*
  |--------------------------------------------------------------------------
  | Methods
  |--------------------------------------------------------------------------
  |
  |
  */

  get () {
    return (async () => {
      try {
        return await this.db.query('my_index/sources', {reduce: true, group: true})
      } catch (err) {
        throw (err)
      }
    })()
  }
}

module.exports = Sources
