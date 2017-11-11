import Axios from 'axios'

import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
import {UserData} from './models/userData'

PouchDB.plugin(PouchDBFind)
PouchDB.plugin(require('pouchdb-quick-search'))
PouchDB.plugin(require('pouchdb-authentication'))

export class Initialize {
    public open(userId: string): PouchDB.Database {
        // todo: is db/ ok to use here?
        const db = new PouchDB('db/' + userId)

        // create quick-search index
        db.search({
            build: true,
            fields: ['text', 'tags', 'source'],
        }).then((info: any) => {
            // console.log(info)
        }).catch((err: any) => {
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

    public customIndex(db: PouchDB.Database) {
        // save the index
        const customIndex = require('./helpers/customIndex')
        db.put(customIndex).then(() => {
            // run each query to create an index.
            db.query('my_index/tags', {limit: 0, reduce: true, group: true})
            db.query('my_index/sources', {limit: 0, reduce: true, group: true})
            db.query('my_index/dids', {limit: 0, reduce: true, group: true})
        }).catch((err: any) => {
            if (err.name !== 'conflict') {
                console.log(err)
            }
            // ignore if doc already exists
        })
    }

    public async sync(db: PouchDB.Database, user: UserData) {
        const remote = new PouchDB(process.env.SYNC_SERVER + '/db', {})

        await Axios.post(
            process.env.SYNC_SERVER + '/db/_session',
            {
                name: 'didbot-private.dev_c8df99a0-0562-11e7-9082-bfd7aa3311e8',
                password: ''
            },
            {
                headers: {
                    // need to pass a body with the request or session won't be set in sync gateway.
                    'Authorization': 'Bearer ' + user.token,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }).then((response) => {
            // console.log('New SG session, starting sync!')
        }).catch((eerror) => {
                // console.log('Error starting sync. ' + e)
            }
        )

        db.sync(remote, {
            live: true,
            retry: true,
            back_off_function(delay) {
                if (delay === 0) {
                    return 1000
                }
                return delay * 3
            }
        })
            .on('change', (info) => {
                window.console.log(info)
            }).on('paused', (err) => {
            window.console.log(err)
        }).on('active', () => {
            // replicate resumed (e.g. new changes replicating, user went back online)
        }).on('denied', (err) => {
            window.console.log(err)
        }).on('complete', (info) => {
            window.console.log(info)
        }).on('error', (err) => {
            window.console.log(err)
        })
    }
}
