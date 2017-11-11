/// <reference types="pouchdb-core" />
// tslint:disable-next-line:no-namespace
declare namespace PouchDB {
    // tslint:disable-next-line:interface-name
    interface Database<Content extends {} = {}> {
        search(input: any): Promise<any>
    }
}

declare module 'pouchdb-quick-search' {
    const plugin: PouchDB.Plugin
    export = plugin
}
