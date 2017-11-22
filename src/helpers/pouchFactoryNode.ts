import * as PouchDB from 'pouchdb'
import * as PouchDBFind from 'pouchdb-find'

export class PouchFactoryNode {

    public static make(userId: string): PouchDB.Database {
        PouchDB.plugin(PouchDBFind)
        PouchDB.plugin(require('pouchdb-quick-search'))
        PouchDB.plugin(require('pouchdb-authentication'))

        // TODO: is there a better way to handle this?
        if (__dirname.includes('didbot-core/dist') ) {
            return new PouchDB(__dirname + '/../../../db/' + userId) // running as js
        } else {
            return new PouchDB(__dirname + '/../../db/' + userId) // ts
        }
    }

}
