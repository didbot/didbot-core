export class UserData {
    public id: string
    public email: string
    public name: string
    public token: string

    constructor(id: string, email: string, name: string, token: string) {
        this.email  = email
        this.id     = id
        this.name   = name
        this.token  = token
    }
}
