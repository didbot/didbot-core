const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-quick-search'))
PouchDB.plugin(require('pouchdb-authentication'))

class Initialize {
  constructor (dbName) {
    // todo: is db/ ok to use here?
    let db = new PouchDB('db/' + dbName)

    // create quick-search index
    db.search({
      fields: ['text', 'tags', 'source'],
      build: true
    }).then(function (info) {
      console.log(info)
    }).catch(function (err) {
      console.log(err)
    })

    // create tags index
    db.createIndex({
      index: {
        fields: ['tags']
      }
    })

    // create source index
    db.createIndex({
      index: {
        fields: ['source']
      }
    })

    return db
  }
}

module.exports = Initialize
