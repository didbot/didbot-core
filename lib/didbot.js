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
  async login (email, password) {
    try {
      await this.user.login(email, password)
      if (this.user.authenticated) {
        this.db       = await new Initialize(this.user)
        this.did      = await new Did(this.db)
        this.dids     = await new Dids(this.db)
        this.tags     = await new Tags(this.db)
        this.sources  = await new Sources(this.db)
      }
      return true
    } catch (err) {
      this.authenticated = false
      throw (err)
    }
  }
}

module.exports = Didbot
