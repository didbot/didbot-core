const Crud = require('../lib/crud')

class Did {
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

    this.getDids()
  }

  async getDids () {
    this.dids = await this.crud.getDids(this.filters)
    return true
  }

  async createDid (body) {
    await this.crud.createDid(body)
    await this.getDids()

    return true
  }

  async updateDid (id, body) {
    //

    this.dids = await this.getDids()
  }

  async setFilters (filters) {
    this.filters.q      = filters.q
    this.filters.tags   = filters.tags
    this.filters.source = filters.source

    this.dids = await this.getDids()
  }
}

module.exports = Did
