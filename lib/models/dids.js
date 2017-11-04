const Did = require('./did')

/**
* Handles working with a collection of dids particularly pagination.
* See https://pouchdb.com/2014/04/14/pagination-strategies-with-pouchdb.html
*/
class Dids {

  constructor (db) {
    /**
     * @var pouchdb instance
     */
    this.db   = db

    /**
     * Holds the collection of did objects.
     *
     * @var array
     */
    this.data = []

    /**
     * Filters holds the user accessible filter properties. Filters will be interpreted into the params object by this
     * class prior to each search.
     *
     * @var object
     */
    this.filters = {
      q: null,
      from: null,
      to: null,
      tag: null,
      source: null,
      next: null,
      previous: null
    }

    /**
     * Pagination holds the current pagination state of the collection. It is hydrated by this class after each search.
     *
     * @var object
     */
    this.pagination = {
      first: null,
      next: null,
      previous: null,
      count: 0,
      limit: 20
    }

    /**
     * Set to true when the user has requested all dids matching the given filters.
     *
     * @var boolean
     */
    this._requestedAll = false

    /**
     * Set to true when the user has requested more dids matching the given filters.
     *
     * @var boolean
     */
    this._requestedMore = false

    /**
     * Params is the object passed to the pouchdb find method. It is hydrated by this class from the filters and
     * pagination properties prior to each search.
     *
     * @var object
     */
    this._params = {
      selector: {
        type:   'did',
        _id:    {},
        date:   {},
        tag:    {},
        source: {}
      },
      sort: [{_id: 'desc'}],
      limit:      null
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
  async get () {
    try {

      // hydrate the selector
      this._params.selector = await this._setSelector()

      // determine whether all dids have been requested
      if (this._requestedAll) {
        this._params.limit = undefined
      } else {
        this._params.limit = this.pagination.limit + 1
      }

      // perform the search
      var results = await this.db.find(this._params)

      // set next key
      this._setNext(results.docs)

      // hydrate the results as did objects
      this.data = this._setDids(results.docs)

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

  async all () {
    return (async () => {
      try {

        this._requestedAll = true
        let limit = this.pagination.limit

        await this.get()

        this.pagination.limit = limit
        this._requestedAll = false

        return this

      } catch (err) {
        console.log(err)
      }
    })()
  }

  async more () {
    return (async () => {
      try {

        if (!this.pagination.next) throw new Error('There are no more dids to load')
        this._requestedMore = true
        await this.get()
        this._requestedMore = false
        return this

      } catch (err) {
        console.log(err)
      }
    })()
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
  _setNext (docs) {

    // if the number of docs don't equal the limit there are no more docs to load
    if (docs.length !== this._params.limit) {
      this.pagination.next = null
      return
    }

    // otherwise we know there's at least one more doc
    this.pagination.next = docs.pop()._id
    return docs
  }

  _setDids (results) {

    let dids = (this._requestedMore) ? this.data : []

    for (let result of results) {
      let did = new Did(this.db)
      did.hydrate(result)
      dids.push(did)
    }

    return dids
  }

  async _setSelector () {
    try {

      let selector = {
        _id: {},
        type: 'did',
        date: {},
        tag: {},
        source: {}
      }

      if (this._isMultipleWordQuery(this.filters.q)) {
        // get ids for the full text search match
        let ids = await this._getDidsUsingFullTextSearch(this.filters.q)

        selector._id = {
          $in: ids
        }

      } else if (this.filters.q) {

        // otherwise just do a wildcard search against the text
        selector.text = {
          $regex: this.filters.q
        }

      }

      // set from and to
      if (this.filters.from) selector.date.$gte = this.filters.from
      if (this.filters.to) selector.date.$lte = this.filters.to

      // set tag and source
      if (this.filters.tag) selector.tags = {$elemMatch: {$eq: this.filters.tag}}
      if (this.filters.source) selector.source = this.filters.source

      // Using lte here because we want to get limit + 1 results back so we know if there are more pages.
      if (this._requestedMore) {
        selector._id.$lte   = this.pagination.next
      }

      return selector

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
  async totalDids () {
    try {
      // index defined in initialize.js
      let result = await this.db.query('my_index/dids', {limit: 0, reduce: true, group: true})

      return result.total_rows
    } catch (err) {
      console.log(err)
    }
  }

  /**
   * Returns the current data object as a json string
   * @return string
   */
  json () {
    return this.data.toJSON()
  }

  /**
   * Returns the current data object as a csv string
   * @return string
   */
  csv () {
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
   * Determines whether the query contains more then one word. If so full text search will be used.
   * @return boolean
   */
  _isMultipleWordQuery (query) {
    if (query && /\s/g.test(query)) {
      return true
    }

    return false
  }

  /**
   * Performs a full text search for the given q. Returns an array of did ids.
   * @return array
   */
  _getDidsUsingFullTextSearch (q) {
    return (async () => {
      try {

        var qDocs = await this.db.search({
          query: q,
          fields: ['text']
        })

        let ids = qDocs.rows.map(function (row) {
          return row.id
        })

        return ids

      } catch (err) {
        throw (err)
      }

    })()
  }

}

module.exports = Dids
