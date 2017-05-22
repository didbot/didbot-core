'use strict'

const test = require('ava')
const moment = require('moment')
const Initialize = require('../lib/initialize')
const db = new Initialize('db3/database')

const Crud = require('../lib/crud')
const crud = new Crud(db)
const Factory = require('../helpers/factory')
const factory = new Factory()
const Did = require('../lib/did')

test.before('seed test cases', async t => {
  try {
    let d = await factory.did(4)

    for (let i = 0; i < 4; i++) {
      await crud.createDid(d[i])
    }
  } catch (err) {
    console.log(err)
  }
})

test.serial('Test all dids are loaded into Did.dids', async t => {
  let did = new Did(db)
  await did.getDids() // need to call again to await the dids loaded. Wouldn't need this in production.

  t.is(did.dids.docs.length, 4)
})

test.serial('Test new did is loaded into Did.dids on did creation', async t => {
  let did = new Did(db)
  await did.getDids() // need to call again to await the dids loaded. Wouldn't need this in production.

  t.is(did.dids.docs.length, 4)

  let newDid = {
    text: 'this is a test did',
    source: 'test',
    tags: ['test'],
    geo: {}
  }

  await did.createDid(newDid)
  t.is(did.dids.docs.length, 5)
})

test.after.always('guaranteed cleanup', async t => {
  try {
    await db.destroy()
  } catch (err) {
    console.log(err)
  }
})
