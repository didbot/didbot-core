const Axios = require('axios')

class User {
  constructor () {
    this.id = null
    this.name = null
    this.email = null
    this.token = null
    this.authenticated = null // initial value = null, valid token = true, no token or invalid token = false
  }

  async login (email, password) {
    try {
      let server = process.env.AUTH_SERVER
      let response = await Axios.post(server + '/jwt', {
        //grant_type: 'password',
        //client_id: process.env.CLIENT_ID,
        //client_secret: process.env.CLIENT_SECRET,
        email: email,
        password: password
        //scope: ''
      })

      this.token = response.data.token
      await this.getUserInfo()
    } catch (err) {
      this.authenticated = false
      throw (err)
    }
  }

  /**
   * Using getters and setters so session can be managed outside of the package.
   * We don't want to use pouch to manage session or we'll have to use filtered
   * replication.
   */
  get () {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      token: this.token
    }
  }

  async set (user) {

    this.id = user.id
    this.name = user.name
    this.email = user.email
    this.token = user.token

    // validate the token
    this.authenticated = null
    await this.getUserInfo()
    return true
  }

  async getUserInfo () {
    try {
      let result = await Axios.get(process.env.AUTH_SERVER + '/openid/userinfo', {
        headers: { Authorization: 'Bearer ' + this.token }
      })

      this.id = result.data.id
      this.name = result.data.name
      this.email = result.data.email
      this.authenticated = true
      return true

    } catch (err) {
      this.authenticated = false
      throw (err)
    }
  }
}

module.exports = User
