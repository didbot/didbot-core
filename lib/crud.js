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

        did = {
          _id: did.date ? did.date : date,
          type: 'did',
          text: did.text,
          tags: did.tags,
          source: did.source,
          user: 'pupshaw',
          geo: did.geo,
          date: date
        }

        validate(did, null)
        return await this.db.put(did)

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

  getDid (id) {
    return (async () => {
      try {
        return await this.db.get(id)
      } catch (err) {
        throw (err)
      }
    })()
  }
}

module.exports = Crud
