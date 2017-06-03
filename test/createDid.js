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
    meta: {
      'distance': 50,
      'speed': 'real quick',
      'finished': false
    },
    tags: ['one tag', 'two_tag'],
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
    meta: {},
    tags: [],
    source: 'node'
  }

  try {
    await crud.createDid(newDid)
  } catch (err) {
    t.deepEqual(err, {forbidden: 'Document must have a text'})
  }

  newDid.text = ''

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
    meta: {},
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
    meta: {},
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
    meta: {},
    source: 'node',
    tags: 'tag'
  }

  try {
    await crud.createDid(newDid)
  } catch (err) {
    t.deepEqual(err, {forbidden: 'doc.tags must be an array'})
  }

  newDid.tags = {
    some: 'property'
  }

  try {
    await crud.createDid(newDid)
  } catch (err) {
    t.deepEqual(err, {forbidden: 'doc.tags must be an array'})
  }

})

/**
 * Test
 */
test.serial('crud.createDid fails validation if tags are not a string', async t => {
  let crud = new Crud(db)
  let newDid = {
    text: 'hello',
    meta: {},
    source: 'node',
    tags: [
      {some: 'property'}
    ]
  }

  try {
    await crud.createDid(newDid)
  } catch (err) {
    t.deepEqual(err, {forbidden: 'all doc.tags must be a string'})
  }

  newDid.tags = [
    1
  ]

  try {
    await crud.createDid(newDid)
  } catch (err) {
    t.deepEqual(err, {forbidden: 'all doc.tags must be a string'})
  }
})

/**
 * Test
 */
test.serial('crud.createDid fails validation if tags longer then 50 characters', async t => {
  let crud = new Crud(db)
  let newDid = {
    text: 'hello',
    meta: {},
    source: 'node',
    tags: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    ]
  }

  try {
    await crud.createDid(newDid)
  } catch (err) {
    t.deepEqual(err, {forbidden: 'all doc.tags must be no longer then 50 characters'})
  }
})

/**
 * Test
 */
test.serial('crud.createDid fails validation if meta not an object', async t => {
  let crud = new Crud(db)
  let newDid = {
    text: 'hello',
    meta: 'hi',
    source: 'node',
    tags: []
  }

  try {
    await crud.createDid(newDid)
  } catch (err) {
    t.deepEqual(err, {forbidden: 'doc.meta must be an object'})
  }

  newDid.meta = ['hi']

  try {
    await crud.createDid(newDid)
  } catch (err) {
    t.deepEqual(err, {forbidden: 'doc.meta must be an object'})
  }

})

/**
 * Test
 */
test.serial('crud.createDid fails validation if meta has more then five keys', async t => {
  let crud = new Crud(db)
  let newDid = {
    text: 'hello',
    meta: {
      'one': 1,
      'two': 2,
      'three': 3,
      'four': 4,
      'five': 5,
      'six': 6
    },
    source: 'node',
    tags: []
  }

  try {
    await crud.createDid(newDid)
  } catch (err) {
    t.deepEqual(err, {forbidden: 'doc.meta cannot have more then 5 properties'})
  }
})

/**
 * Test
 */
test.serial('crud.createDid fails validation if meta has property longer then 150 characters', async t => {
  let crud = new Crud(db)
  let newDid = {
    text: 'hello',
    meta: {
      'lorem': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed elementum, nibh vel facilisis finibus, ante ex imperdiet urna, vel volutpat lorem enim eu orci. Curabitur et nibh enim. Vivamus pharetra semper elementum. In egestas placerat velit.'
    },
    source: 'node',
    tags: []
  }

  try {
    await crud.createDid(newDid)
  } catch (err) {
    t.deepEqual(err, {forbidden: 'doc.meta properties cannot be longer then 150 characters'})
  }
})

/**
 * Test
 */
test.serial('crud.createDid fails validation if meta has key longer then 50 characters', async t => {
  let crud = new Crud(db)
  let newDid = {
    text: 'hello',
    meta: {
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed elementum': 'Lorem ipsum dolor sit amet.'
    },
    source: 'node',
    tags: []
  }

  try {
    await crud.createDid(newDid)
  } catch (err) {
    t.deepEqual(err, {forbidden: 'doc.meta keys cannot be longer then 50 characters'})
  }
})

test.after.always('guaranteed cleanup', async t => {
  try {
    await db.destroy()
  } catch (err) {
    console.log(err)
  }
})
