const moment = require('moment')
const ULID = require('ulid')
const validate = require('../design')

class Did {
  constructor (db) {
    /**
     * @var pouchdb instance
     */
    this.db   = db

    /**
     * Holds the did properties
     *
     * @var array
     */
    this._data = {
      _id:    null,
      _rev:   null,
      type:   null,
      user:   null,
      date:   null,
      text:   null,
      source: null,
      tags:   [],
      meta:   []
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Getters
  |--------------------------------------------------------------------------
  |
  |
  */

  /**
   * @return object
   */
  getData () {
    return this._data
  }

  /**
   * @return string
   */
  getType () {
    return this._data.type
  }

  /**
   * @return ulid
   */
  getId () {
    return this._data._id
  }

  /**
   * @return moment object
   */
  getDate () {
    return this._data.date
  }

  /**
   * @return string
   */
  getText () {
    return this._data.text
  }

  /**
   * @return array
   */
  getTags () {
    return this._data.tags
  }

  /**
   * @return ulid
   */
  getUser () {
    return this._data.user
  }

  /**
   * @return array
   */
  getMeta () {
    return this._data.meta
  }

  /**
   * @return string
   */
  getSource () {
    return this._data.source
  }

  /*
  |--------------------------------------------------------------------------
  | Setters
  |--------------------------------------------------------------------------
  |
  |
  */

  /**
   * @param text string
   */
  setText (text) {
    this._data.text = text
  }

  /**
   * @param tags array
   */
  setTags (tags) {
    this._data.tags = tags
  }

  /**
   * @param meta array
   */
  setMeta (meta) {
    this._data.meta = meta
  }

  /**
   * @param string array
   */
  setSource (source) {
    this._data.source = source
  }

  /*
  |--------------------------------------------------------------------------
  | CRUD Methods
  |--------------------------------------------------------------------------
  |
  |
  */

  /**
   * Returns a single did by id
   */
  find (id) {
    return (async () => {
      try {

        let result = await this.db.get(id)

        // return a new instance of self
        let did = new Did(this.db)
        did.hydrate(result)
        return did

      } catch (err) {
        throw (err)
      }
    })()
  }

  /**
   * Saves or updates a did. Note that the following properties cannot be modified
   * once set: id, user, type, source, date
   */
  save () {
    return (async () => {
      try {

        if (this._data._rev) {
          await this._prepForUpdate()
        } else {
          this._prepForInsert()
        }

        let result = await this.db.put(this._data)
        return this.find(result.id)

      } catch (err) {
        throw (err)
      }
    })()
  }

  /**
   * Deletes a did
   */
  destroy () {
    return (async () => {
      try {
        return await this.db.remove(this._data._id, this._data._rev)
      } catch (err) {
        throw (err)
      }
    })()
  }

  /*
  |--------------------------------------------------------------------------
  | Other Methods
  |--------------------------------------------------------------------------
  |
  |
  */

  /**
   * Prepare the model for an insert
   */
  _prepForInsert () {
    this._data._id = ULID.ulid()
    this._data.date = new Date().toJSON()
    this._data.user = this.db.user.id
    this._data.type = 'did'
    validate(this._data, null)
  }

  /**
   * Prepare the model for an update
   */
  async _prepForUpdate () {
    let oldDid = await this.find(this._data._id)
    this._data.user   = oldDid._data.user
    this._data.type   = oldDid._data.type
    this._data.date   = oldDid._data.date.toJSON()
    this._data.source = oldDid._data.source
    validate(this._data, oldDid._data)
  }

  /**
   * Hydrates a did from the given object
   */
  hydrate (input) {
    this._data._id  = input._id
    this._data._rev = input._rev
    this._data.date = moment(input.date)
    this._data.user = input.user
    this._data.type = input.type

    this.setText(input.text)
    this.setTags(input.tags)
    this.setMeta(input.meta)
    this.setSource(input.source)
  }

}

module.exports = Did
