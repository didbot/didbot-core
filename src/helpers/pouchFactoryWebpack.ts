import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'

export class PouchFactoryWebpack {

    public static make(userId: string): PouchDB.Database {
        PouchDB.plugin(PouchDBFind)
        PouchDB.plugin(require('pouchdb-quick-search'))
        PouchDB.plugin(require('pouchdb-authentication'))

        return new PouchDB('db/' + userId)
    }

}
