var moment = require('moment')
var validate = require('./design')

class Crud {
  constructor (db) {
    this.db = db
  }

  createDid (did) {
    return (async () => {
      try {
        let date = moment.utc().toJSON()

        let newDid = {
          _id: did.date ? did.date : date,
          type: 'did',
          text: did.text,
          tags: did.tags,
          source: did.source,
          user: 'pupshaw',
          geo: {
            city:         did.geo.city          ? did.geo.city : null,
            country:      did.geo.country       ? did.geo.country : null,
            country_code: did.geo.country_code  ? did.geo.country_code : null,
            latitude:     did.geo.latitude      ? did.geo.latitude : null,
            longitude:    did.geo.longitude     ? did.geo.longitude : null,
            state:        did.geo.state         ? did.geo.state : null,
            street:       did.geo.street        ? did.geo.street : null,
            zip:          did.geo.zip           ? did.geo.zip : null
          },
          date: date
        }

        validate(newDid, null)
        return await this.db.put(newDid)

      } catch (err) {
        throw (err)
      }
    })()
  }

  async getDids (filters) {
    try {

      // limit docs to type:did by default
      let selector = {
        type: 'did'
      }

      // if q is more then one word get ids for the full text search match
      if (filters.q && /\s/g.test(filters.q)) {
        let ids = await this.getDidsUsingFullTextSearch(filters.q)

        selector._id = {
          $in: ids
        }
      } else if (filters.q) {
        // otherwise just do a wildcard search against the text
        selector.text = {
          $regex: filters.q
        }
      }

      // set from and to
      if (filters.from || filters.to) {
        selector._id = {}
        if (filters.from) selector._id.$gte = filters.from
        if (filters.to) selector._id.$lte = filters.to
      }

      // set tag and source
      if (filters.tag) selector.tags = {$elemMatch: {$eq: filters.tag}}
      if (filters.source) selector.source = filters.source

      return await this.db.find({
        selector: selector
      })

    } catch (err) {
      throw (err)
    }
  }

  getDid (id) {
    return (async () => {
      try {
        return await this.db.get(id)
      } catch (err) {
        throw (err)
      }
    })()
  }

  updateDid (newDid) {
    return (async () => {
      try {
        let oldDid = await this.db.get(newDid._id)

        // Update the new did with all of the oldDids un-editable fields
        newDid._id = oldDid._id
        newDid._rev = oldDid._rev
        newDid.geo = oldDid.geo
        newDid.user = oldDid.user
        newDid.type = oldDid.type
        newDid.source = oldDid.source
        newDid.date = oldDid.date
        validate(newDid, oldDid)

        return await this.db.put(newDid)
      } catch (err) {
        throw (err)
      }
    })()
  }

  deleteDid (did) {
    return (async () => {
      try {
        return await this.db.remove(did)
      } catch (err) {
        throw (err)
      }
    })()
  }

  getDidsUsingFullTextSearch (q) {
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

  getDidsUsingAllDocs (filters) {
    return (async () => {
      try {

        let options = {
          descending: true,
          include_docs: true,
          // since decending is true, end key and start key are opposite of what would make sense
          endkey: (filters.from) ? filters.from : null,
          startkey: (filters.to) ? filters.to : null,
        }

        return await this.db.allDocs(options)
      } catch (err) {
        throw (err)
      }
    })()
  }

  getTags (id) {
    return (async () => {
      try {
        return await this.db.query('my_index/tags', {reduce: true, group: true})
      } catch (err) {
        throw (err)
      }
    })()
  }

  getSources (id) {
    return (async () => {
      try {
        return await this.db.query('my_index/sources', {reduce: true, group: true})
      } catch (err) {
        throw (err)
      }
    })()
  }
}

module.exports = Crud
