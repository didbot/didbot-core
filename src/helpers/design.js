function validate (newDoc, oldDoc) {
  if (newDoc._deleted) {
    // return if this doc was deleted before it was synced
    if (oldDoc === null) return

    // Only a document owner can delete documents:
    requireUser(oldDoc.user)
    return // Skip other validation because a deletion has no other properties:
  }

  /* --------------------------------------------------------------------------
  | Validate the size of the entire newDoc object is something sane
  |-------------------------------------------------------------------------- */
  if (JSON.stringify(newDoc).length > 5000) {
    throw new Error('The did ' + newDoc._id + ' is too large')
  }

  /* --------------------------------------------------------------------------
  | Require the following fields
  |-------------------------------------------------------------------------- */
  function require (field, message) {
    message = message || 'Document must have a ' + field
    if (!newDoc[field]) throw new Error(message)
  }

  require('_id')
  require('text')
  require('tags')
  require('user')
  require('type')
  require('source')
  require('date')

  /* --------------------------------------------------------------------------
  | Validate uuid fields are ulid
  |-------------------------------------------------------------------------- */
  function isUlid (field) {
    let message = field + ' must be a ULID'
    let regex = /^[ABCDEFGHJKMNPQRSTVWXYZ0-9]{26}$/i

    if (!regex.test(newDoc[field])) {
      throw new Error(message)
    }
  }

  isUlid('_id')
  isUlid('user')

  /* --------------------------------------------------------------------------
  | Validate date fields are ISO-8601
  |-------------------------------------------------------------------------- */
  function isDate (field) {
    let message = field + ' must be a ISO-8601 date string'
    let regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/i

    if (!regex.test(newDoc[field])) {
      throw new Error(message)
    }
  }

  isDate('date')

  /* --------------------------------------------------------------------------
  | Validate the user property matches the logged in user
  |-------------------------------------------------------------------------- */
  if (oldDoc === null) {
    // The 'creator' property must match the user creating the document:
    requireUser(newDoc.user)
    channel(newDoc.user)
  } else {
    // Only users in the existing doc's writers list can change a document:
    requireUser(oldDoc.user)
  }

  /* --------------------------------------------------------------------------
   | Leave the following fields unchanged
   |-------------------------------------------------------------------------- */
  function unchanged (field) {
    if (oldDoc && JSON.stringify(oldDoc[field]) !== JSON.stringify(newDoc[field])) {
      throw new Error('Field can\'t be changed: ' + field)
    }
  }

  unchanged('_id')
  unchanged('user')
  unchanged('type')
  unchanged('source')
  unchanged('date')

  /* --------------------------------------------------------------------------
  | Require the following fields be strings that are less then 250 characters
  |-------------------------------------------------------------------------- */
  function isString (field) {
    if (typeof newDoc[field] !== 'string') {
      throw new Error(field + ' must be a string')
    }

    if (newDoc[field].length > 250) {
      throw new Error(field + ' cannot be longer then 250 characters')
    }
  }

  isString('_id')
  isString('text')
  isString('user')
  isString('type')
  isString('source')
  isString('date')

  /* --------------------------------------------------------------------------
  | Validate _rev
  |-------------------------------------------------------------------------- */

  // 1-93740efcc0c94dc28cc31e78a145b101
  if (newDoc._rev) {
    isString('_rev')
    unchanged('_rev')
  }

  /* --------------------------------------------------------------------------
  | Error if any other fields are present
  |-------------------------------------------------------------------------- */

  Object.keys(newDoc).forEach(function (key, i, keys) {
    if (
      key !== '_id' &&
      key !== '_rev' &&
      // key !== '_revisions' &&
      key !== 'type' &&
      key !== 'text' &&
      key !== 'tags' &&
      key !== 'source' &&
      key !== 'user' &&
      key !== 'meta' &&
      key !== 'date'
    ) {
      throw new Error('only _id, _rev, type, text, tags, source, meta, user, and date are permitted')
    }
  })

  // We only allow did docs for now
  if ((oldDoc && oldDoc.type !== 'did') || newDoc.type !== 'did') {
    throw new Error('doc.type must equal did')
  }

  /* --------------------------------------------------------------------------
  | Tags Validation
  |-------------------------------------------------------------------------- */

  // tags must be an array
  if (!Array.isArray(newDoc.tags)) {
    throw new Error('doc.tags must be an array')
  }

  for (let tag of newDoc.tags) {
    // tags must be strings
    if (typeof tag !== 'string') {
      throw new Error('all doc.tags must be a string')
    }

    // less then 50 cahracters
    if (tag.length > 20) {
      throw new Error('all doc.tags must be no longer then 20 characters')
    }

    let regex = /^[a-z0-9-]*$/i
    if (!regex.test(tag)) {
      throw new Error('all doc.tags must consist of [a-z0-9-]')
    }
  }

  /* --------------------------------------------------------------------------
  | Meta Object Validation
  |-------------------------------------------------------------------------- */

  // meta must be an object
  if (typeof newDoc.meta !== 'object') {
    throw new Error('doc.meta must be an object')
  }

  if (newDoc.meta.constructor === Array) {
    throw new Error('doc.meta must be an object')
  }

  // meta cannot have more then 5 properties
  if (Object.keys(newDoc.meta).length > 5) {
    throw new Error('doc.meta cannot have more then 5 properties')
  }

  Object.keys(newDoc.meta).forEach(function (key) {
    var val = newDoc.meta[key]
    if (typeof val !== 'number' && typeof val !== 'string' && typeof val !== 'boolean') {
      throw new Error('doc.meta properties must be a number, string, or boolean')
    }

    if (val.length > 150) {
      throw new Error('doc.meta properties cannot be longer then 150 characters')
    }

    if (key.length > 50) {
      throw new Error('doc.meta keys cannot be longer then 50 characters')
    }
  })
}
module.exports = validate

function requireUser () {}

function channel () {}
