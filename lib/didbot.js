const Crud = require('./crud')
const User = require('./user')

class Didbot {
  constructor (db) {
    this.crud = new Crud(db)

    this.filters = {
      q: null,
      tags: null,
      source: null,
      from: null,
      to: null
    }

    this.dids = []
    this.tags = []
    this.sources = []
    this.user = new User()

    this.getDids()
  }

  async getDids () {
    this.dids = await this.crud.getDids(this.filters)
    this.tags = await this.crud.getTags()
    this.sources = await this.crud.getSources()
    return true
  }

  async createDid (body) {
    await this.crud.createDid(body)
    await this.getDids()

    return true
  }

  async updateDid (did) {
    await this.crud.updateDid(did)
    this.dids = await this.getDids()

    return true
  }

  async setFilters (filters) {
    this.filters.q      = filters.q
    this.filters.tags   = filters.tags
    this.filters.source = filters.source

    this.dids = await this.getDids()
  }
}

module.exports = Didbot
