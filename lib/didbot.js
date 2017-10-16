const ulid    = require('ulid')
const User    = require('./models/user')
const Did     = require('./models/did')
const Dids    = require('./models/dids')
const Tags    = require('./models/tags')
const Sources = require('./models/sources')
const Initialize = require('./initialize')

class Didbot {

  /**
   *
   */
  constructor () {
    this.user     = new User()
    this.db       = null
    this.did      = null
    this.dids     = null
    this.tags     = null
    this.sources  = null
  }

  /**
   * @param email
   * @param password
   */
  login (email, password) {
    // this.user.login(email, password)
    if (this.user.authenticated) {
      this.db       = new Initialize(this.user)
      this.did      = new Did(this.db)
      this.dids     = new Dids(this.db)
      this.tags     = new Tags(this.db)
      this.sources  = new Sources(this.db)
    }
  }
}

module.exports = Didbot
