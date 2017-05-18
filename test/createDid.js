'use strict'

const test = require('ava')
const Initialize = require('../lib/initialize')
const db = new Initialize('db1/database')
const Crud = require('../lib/crud.js')

/**
 * Test
 */
test.serial('crud.createDid success', async t => {
  let crud = new Crud(db)
  let newDid = {
    text: 'hello',
    geo: 'fake',
    tags: [],
    source: 'node'
  }

  let response = await crud.createDid(newDid)
  t.truthy(response.id)
})

/**
 * Test
 */
test.serial('crud.createDid fails validation if no text', async t => {
  let crud = new Crud(db)
  let newDid = {
    geo: 'fake',
    tags: [],
    source: 'node'
  }

  try {
    await crud.createDid(newDid)
  } catch (err) {
    t.deepEqual(err, {forbidden: 'Document must have a text'})
  }

})

/**
 * Test
 */
test.serial('crud.createDid fails validation if no tags', async t => {
  let crud = new Crud(db)
  let newDid = {
    text: 'hello',
    geo: 'fake',
    source: 'node'
  }

  try {
    await crud.createDid(newDid)
  } catch (err) {
    t.deepEqual(err, {forbidden: 'Document must have a tags'})
  }

})

/**
 * Test
 */
test.serial('crud.createDid fails validation if no source', async t => {
  let crud = new Crud(db)
  let newDid = {
    text: 'hello',
    geo: 'fake',
    tags: []
  }

  try {
    await crud.createDid(newDid)
  } catch (err) {
    t.deepEqual(err, {forbidden: 'Document must have a source'})
  }

})

/**
 * Test
 */
test.serial('crud.createDid fails validation if tags not array', async t => {
  let crud = new Crud(db)
  let newDid = {
    text: 'hello',
    geo: 'fake',
    source: 'node',
    tags: 'tag'
  }

  try {
    await crud.createDid(newDid)
  } catch (err) {
    t.deepEqual(err, {forbidden: 'doc.tags must be an array'})
  }

})

test.after.always('guaranteed cleanup', async t => {
  try {
    await db.destroy()
  } catch (err) {
    console.log(err)
  }
})
