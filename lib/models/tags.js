/**
 * Handles working with a collection of Tags
 */
class Tags {
  constructor (db) {
    /**
     * @var pouchdb instance
     */
    this.db   = db

    /**
     * Holds the tags
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
        return await this.db.query('my_index/tags', {reduce: true, group: true})
      } catch (err) {
        throw (err)
      }
    })()
  }
}

module.exports = Tags
