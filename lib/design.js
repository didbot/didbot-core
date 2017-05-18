function validate (newDoc, oldDoc) {
  if (newDoc._deleted) {

    // return if this doc was deleted before it was synced
    if (oldDoc === null) return

    // Only a document owner can delete documents:
    requireUser(oldDoc.user)
    return // Skip other validation because a deletion has no other properties:
  }

  /* --------------------------------------------------------------------------
   | Require the following fields
   |--------------------------------------------------------------------------*/
  function require(field, message) {
    message = message || 'Document must have a ' + field
    if (!newDoc[field]) throwError({forbidden: message})
  }

  require('_id')
  require('geo')
  require('text')
  require('tags')
  require('user')
  require('type')
  require('source')
  require('date')

  /*--------------------------------------------------------------------------
   | Validate the user property matches the logged in user
   |--------------------------------------------------------------------------*/
  if (oldDoc === null) {
    // The 'creator' property must match the user creating the document:
    requireUser(newDoc.user)
    channel(newDoc.user)
  } else {
    // Only users in the existing doc's writers list can change a document:
    requireUser(oldDoc.user)
  }

  /*--------------------------------------------------------------------------
   | Leave the following fields unchanged
   |--------------------------------------------------------------------------*/
  function unchanged(field) {
    if (oldDoc && JSON.stringify(oldDoc[field]) !== JSON.stringify(newDoc[field])) {
      throwError({forbidden: 'Field can\'t be changed: ' + field})
    }
  }

  unchanged('_id')
  unchanged('geo')
  unchanged('user')
  unchanged('type')
  unchanged('source')
  unchanged('date')

  /*--------------------------------------------------------------------------
   | Error if any other fields are present
   |--------------------------------------------------------------------------*/

  Object.keys(newDoc).forEach(function (key, i, keys) {
    if (
      key !== '_id' &&
      key !== '_rev' &&
      key !== '_revisions' &&
      key !== 'type' &&
      key !== 'text' &&
      key !== 'tags' &&
      key !== 'source' &&
      key !== 'user' &&
      key !== 'geo' &&
      key !== 'date'
    ) {
      throwError({forbidden: 'only _id, type, text, tags, source, geo, user, and date are permitted'});
    }
  })

  // We only allow did docs for now
  if ((oldDoc && oldDoc.type !== 'did') || newDoc.type !== 'did') {
    throwError({forbidden: 'doc.type must equal did'})
  }

  // tags must be an array
  if (!Array.isArray(newDoc.tags)) {
    throwError({forbidden: 'doc.tags must be an array'})
  }

  // using since eslint doesn't like throw({forbidden: message})
  function throwError (message) {
    throw message
  }
}
module.exports = validate

function requireUser () {}

function channel () {}
