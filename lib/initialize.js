const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-quick-search'))
PouchDB.plugin(require('pouchdb-authentication'))

class Initialize {
  constructor (dbName, userId) {
    // todo: is db/ ok to use here?
    let db = new PouchDB('db/' + dbName)

    // create quick-search index
    db.search({
      fields: ['text', 'tags', 'source'],
      build: true
    }).then(function (info) {
      // console.log(info)
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

    db.createIndex({
      index: {
        fields: ['type']
      }
    })

    this.customIndex(db)

    db.user = {
      id: userId
    }

    return db
  }

  customIndex (db) {
    //https://pouchdb.com/guides/queries.html
    var ddoc = {
      _id: '_design/my_index',
      views: {
        tags: {
          map: function (doc) {
            if (doc.type === 'did' && doc.tags) {
              doc.tags.forEach(function (tag) {
                emit(tag, null)
              })
            }
          }.toString(),
          reduce: '_count'
        },
        sources: {
          map: function (doc) {
            if (doc.type === 'did' && doc.source) {
              emit(doc.source, null)
            }
          }.toString(),
          reduce: '_count'
        },
        dids: {
          map: function (doc) {
            if (doc.type === 'did') {
              emit(doc.type, null)
            }
          }.toString(),
          reduce: '_count'
        }
      }
    }

    // save the index
    db.put(ddoc).then(function () {
      // run each query to create an index.
      db.query('my_index/tags', {limit: 0, reduce: true, group: true})
      db.query('my_index/sources', {limit: 0, reduce: true, group: true})
      db.query('my_index/dids', {limit: 0, reduce: true, group: true})
    }).catch(function (err) {
      if (err.name !== 'conflict') {
        console.log(err)
      }
      // ignore if doc already exists
    })
  }
}

module.exports = Initialize
