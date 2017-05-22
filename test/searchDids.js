'use strict'

const test = require('ava')
const moment = require('moment')
const Crud = require('../lib/crud')
const Factory = require('../helpers/factory')
const Initialize = require('../lib/initialize')

const db = new Initialize('db2/database')
const crud = new Crud(db)

test.before('seed test cases', async t => {
  try {
    let factory = new Factory()
    let d = await factory.did(4)

    d[0].date = moment('2017-01-01 05:00:00').toJSON()
    d[1].date = moment('2017-01-02 05:00:00').toJSON()
    d[2].date = moment('2017-01-03 05:00:00').toJSON()
    d[3].date = moment('2017-01-04 05:00:00').toJSON()

    d[0].tags = ['tag5']
    d[1].tags = ['tag2', 'tag4']
    d[2].tags = ['tag1', 'tag2', 'tag3']
    d[3].tags = ['tag1', 'tag2']

    d[0].source = 'web'
    d[1].source = 'web'
    d[2].source = 'mobile'
    d[3].source = 'console'

    for (let i = 0; i < 4; i++) {
      await crud.createDid(d[i])
    }
  } catch (err) {
    console.log(err)
  }
})

test.serial('Test Crud getDidsUsingAllDocs from and to filters', async t => {
  let filters = {
    to: null,
    from: null
  }

  let allDids = await crud.getDidsUsingAllDocs(filters)

  filters.from = moment('2017-01-02').toJSON()
  filters.to = moment('2017-01-03').toJSON()

  let someDids = await crud.getDidsUsingAllDocs(filters)

  t.is(someDids.rows.length, 1)
  t.deepEqual(someDids.rows, [
    allDids.rows[6]
  ])
})

test.serial('Test Crud getDids from and to filters', async t => {
  let filters = {}

  let allDids = await crud.getDids(filters)
  t.is(allDids.docs.length, 4)

  filters.from = moment('2017-01-01').toJSON()
  filters.to = moment('2017-01-03').toJSON()

  let someDids = await crud.getDids(filters)

  t.is(someDids.docs.length, 2)
  t.deepEqual(someDids.docs, [
    allDids.docs[0],
    allDids.docs[1]
  ])
})

test.serial('Test Crud getDids tag filter', async t => {
  let filters = {}

  let allDids = await crud.getDids(filters)
  t.is(allDids.docs.length, 4)

  filters.tag = 'tag2'
  let someDids = await crud.getDids(filters)

  t.is(someDids.docs.length, 3)
  t.deepEqual(someDids.docs, [
    allDids.docs[1],
    allDids.docs[2],
    allDids.docs[3]
  ])
})

test.serial('Test Crud getDids source filter', async t => {
  let filters = {}

  let allDids = await crud.getDids(filters)
  t.is(allDids.docs.length, 4)

  filters.source = 'web'
  let someDids = await crud.getDids(filters)

  t.is(someDids.docs.length, 2)
  t.deepEqual(someDids.docs, [
    allDids.docs[0],
    allDids.docs[1]
  ])
})

test.serial('Test Crud getTags method', async t => {
  let tags = await crud.getTags()

  t.is(tags.rows.length, 5)
  t.deepEqual(tags.rows, [
    {
      'value': 2,
      'key': 'tag1'
    },
    {
      'value': 3,
      'key': 'tag2'
    },
    {
      'value': 1,
      'key': 'tag3'
    },
    {
      'value': 1,
      'key': 'tag4'
    },
    {
      'value': 1,
      'key': 'tag5'
    }
  ])
})

test.serial('Test Crud getSources method', async t => {
  let sources = await crud.getSources()

  t.is(sources.rows.length, 3)
  t.deepEqual(sources.rows, [
    {
      'value': 1,
      'key': 'console'
    },
    {
      'value': 1,
      'key': 'mobile'
    },
    {
      'value': 2,
      'key': 'web'
    }
  ])
})

test.after.always('guaranteed cleanup', async t => {
  try {
    await db.destroy()
  } catch (err) {
    console.log(err)
  }
})
