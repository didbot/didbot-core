const customIndex = {
  _id: '_design/my_index',
  views: {
    tags: {
      map: function (doc) {
        if (doc.type === 'did' && doc.tags) {
          doc.tags.forEach(function (tag) {
            emit(tag, null)
          })
        }
      }.toString(),
      reduce: '_count'
    },
    sources: {
      map: function (doc) {
        if (doc.type === 'did' && doc.source) {
          emit(doc.source, null)
        }
      }.toString(),
      reduce: '_count'
    },
    dids: {
      map: function (doc) {
        if (doc.type === 'did') {
          emit(doc.type, null)
        }
      }.toString(),
      reduce: '_count'
    }
  }
}
module.exports = customIndex
