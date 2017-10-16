const Axios = require('axios')
require('dotenv').config()

const PouchDB = (process.env.RUNTIME === 'webpack') ? require('pouchdb').default : require('pouchdb')
const PouchDBFind = (process.env.RUNTIME === 'webpack') ? require('pouchdb-find').default : require('pouchdb-find')
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(require('pouchdb-quick-search'))
PouchDB.plugin(require('pouchdb-authentication'))

class Initialize {
  constructor (user) {
    // todo: is db/ ok to use here?
    let db = new PouchDB('db/' + user.id)
    db.user = user

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
    // this.sync(db)

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

  async sync (db) {
    let remote = new PouchDB(process.env.SYNC_SERVER + '/db', {skipSetup: true})

    await Axios.post(
      process.env.SYNC_SERVER + '/db/_session',
      {
        name: 'didbot-private.dev_c8df99a0-0562-11e7-9082-bfd7aa3311e8',
        password: ''
      },
      {
        withCredentials: true,
        headers: {
          // need to pass a body with the request or session won't be set in sync gateway.
          'Authorization': 'Bearer ' + this.token,
          'Content-Type': 'application/json',
        }
      }).then(response => {
        console.log('New SG session, starting sync!')
      }).catch(eerror => {
        console.log('Error starting sync. ' + e)
      }
    )

    db.sync(remote, {
      live: true,
      retry: true,
      back_off_function: function (delay) {
        if (delay === 0) {
          return 1000
        }
        return delay * 3
      }
    })
    .on('change', function (info) {
      window.console.log(info)
    }).on('paused', function (err) {
      window.console.log(err)
    }).on('active', function () {
      // replicate resumed (e.g. new changes replicating, user went back online)
    }).on('denied', function (err) {
      window.console.log(err)
    }).on('complete', function (info) {
      window.console.log(info)
    }).on('error', function (err) {
      window.console.log(err)
    })
  }
}

module.exports = Initialize
