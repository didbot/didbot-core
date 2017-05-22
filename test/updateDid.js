'use strict'

const test = require('ava')
const moment = require('moment')
const Crud = require('../lib/crud')
const Factory = require('../helpers/factory')
const Initialize = require('../lib/initialize')

const db = new Initialize('db4/database')
const crud = new Crud(db)

test.before('seed test cases', async t => {
  try {
    let factory = new Factory()
    let d = await factory.did(4)

    d[0].text = 'did number 1'
    d[1].text = 'did number 2'
    d[2].text = 'did number 3'
    d[3].text = 'did number 4'

    d[0].tags = ['tag5']
    d[1].tags = ['tag2', 'tag4']
    d[2].tags = ['tag1', 'tag2', 'tag3']
    d[3].tags = ['tag1', 'tag2']

    for (let i = 0; i < 4; i++) {
      await crud.createDid(d[i])
    }
  } catch (err) {
    console.log(err)
  }
})

test.serial('Test Crud updateDid method', async t => {
  let filters = {}
  let allDids = await crud.getDids(filters)
  let id = allDids.docs[0]._id

  let body = {
    _id: id,
    text: 'updated text',
    tags: ['new tag']
  }
  await crud.updateDid(body)

  let updatedDid = await crud.getDid(id)
  t.is(updatedDid.text, 'updated text')
  t.is(updatedDid.tags[0], 'new tag')
})

test.after.always('guaranteed cleanup', async t => {
  try {
    await db.destroy()
  } catch (err) {
    console.log(err)
  }
})