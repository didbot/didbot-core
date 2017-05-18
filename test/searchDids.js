'use strict'

const test = require('ava')
const moment = require('moment')
const Initialize = require('../lib/initialize')
const db = new Initialize('db2/database')

const Crud = require('../lib/crud')
const Factory = require('../helpers/factory')

/**
 * This test creates four new documents spanning the last four days
 * then runs a search for dids falling in a certain range.
 */
test('crud.getDidsUsingAllDocs', async t => {
  let factory = new Factory()
  let crud = new Crud(db)
  let d = await factory.did(4)

  d[0].date = moment('2017-01-01 05:00:00').toJSON()
  d[1].date = moment('2017-01-02 05:00:00').toJSON()
  d[2].date = moment('2017-01-03 05:00:00').toJSON()
  d[3].date = moment('2017-01-04 05:00:00').toJSON()

  for (let i = 0; i < 4; i++) {
    await crud.createDid(d[i])
  }

  let filters = {
    to: null,
    from: null
  }

  let allDids = await crud.getDidsUsingAllDocs(filters)
  let expected = [
    allDids.rows[4]
  ]

  filters.from = moment('2017-01-02').toJSON()
  filters.to = moment('2017-01-03').toJSON()

  let someDids = await crud.getDidsUsingAllDocs(filters)

  t.is(someDids.rows.length, 1)
  t.deepEqual(someDids.rows, expected)
})

test.after.always('guaranteed cleanup', async t => {
  try {
    await db.destroy()
  } catch (err) {
    console.log(err)
  }
})
