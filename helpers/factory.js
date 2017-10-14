const moment = require('moment')
const ulid = require('ulid')
const Did = require('../lib/models/did.js')
const validate = require('../lib/design')

class Factory {
  constructor (db) {
    this.db = db
  }

  /**
   * Creates did objects given in the count and persists them to the database. Returns a simple array of those
   * did objects.
   *
   * @param count integer
   * @return array
   */
  async dids (count) {
    try {
      const model = new Did(this.db)
      let dids = []

      for (let i = 0; i < count; i++) {
        const date = moment().subtract(i, 'days')

        let data = {
          _id:    ulid(date.valueOf()),
          _rev:   null,
          type:   'did',
          user:   ulid(),
          date:   date.toJSON(),
          text:   'Did ' + i,
          source: 'test',
          tags:   ['test'],
          meta:   {test: true}
        }

        validate(data, null)

        let result  = await this.db.put(data)
        let did     = await model.find(result.id)
        dids.push(did)
      }
      return dids
    } catch (err) {
      console.log(err)
    }
  }

  async did () {
    try {
      const model = new Did(this.db)
      const date = moment()

      let data = {
        _id:    ulid(date.valueOf()),
        _rev:   null,
        type:   'did',
        user:   ulid(),
        date:   date.toJSON(),
        text:   'Did',
        source: 'test',
        tags:   ['test'],
        meta:   {test: true}
      }

      validate(data, null)

      let result  = await this.db.put(data)
      let did     = await model.find(result.id)

      return did
    } catch (err) {
      console.log(err)
    }
  }
}

module.exports = Factory
