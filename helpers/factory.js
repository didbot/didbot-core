const moment = require('moment')
const jsf = require('json-schema-faker')

jsf.format('random-date', function (gen, schema) {
  let lastWeek = moment().subtract(1, 'week').toDate()
  let date = randomDate(lastWeek, new Date())
  return date.toJSON()
})

function randomDate (start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

class Factory {
  constructor () {

    this.didTemplate = {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          format: 'random-date'
        },
        text: {
          type: 'string',
          faker: 'lorem.sentence'
        },
        geo: {
          type: 'object',
          properties: {
            city: {
              type: 'string',
              faker: 'address.city'
            },
            country: {
              type: 'string',
              faker: 'address.country'
            },
            country_code: {
              type: 'string',
              faker: 'address.countryCode'
            },
            latitude: {
              type: 'string',
              faker: 'address.latitude'
            },
            longitude: {
              type: 'string',
              faker: 'address.longitude'
            },
            state: {
              type: 'string',
              faker: 'address.state'
            },
            street: {
              type: 'string',
              faker: 'address.streetAddress'
            },
            zip: {
              type: 'string',
              faker: 'address.zipCode'
            }
          }
        },
        tags: {
          type: 'array',
          minItems: 1,
          maxItems: 3,
          items: {
            $ref: '#/definitions/tag'
          }
        },
        date: {
          type: 'string',
          format: 'random-date'
        },
        source: {
          type: 'string',
          chance: {
            pickone: [
              [
                'banana',
                'apple',
                'orange'
              ]
            ]
          }
        },
        user: {'enum': ['pupshaw']},
        type: {'enum': ['did']}
      },
      required: ['_id', 'text', 'geo', 'tags', 'date', 'source', 'type'],
      definitions: {
        tag: {
          type: 'string',
          faker: 'company.catchPhrase'
        }
      }
    }
  }

  async did (count) {
    let dids = []
    for (let i = 0; i < count; i++) {
      dids.push(await jsf(this.didTemplate))
    }

    return dids
  }
}

module.exports = Factory
