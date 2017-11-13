import * as PouchDB from 'pouchdb'
import * as PouchDBFind from 'pouchdb-find'

export class PouchFactoryNode {

    public static make(userId: string): PouchDB.Database {
        PouchDB.plugin(PouchDBFind)
        PouchDB.plugin(require('pouchdb-quick-search'))
        PouchDB.plugin(require('pouchdb-authentication'))

        return new PouchDB('db/' + userId)
    }

}
