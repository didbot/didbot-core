export class Page {
  public first: number
  public next: string
  public previous: string
  public count: number
  public limit: number

  constructor() {
    this.count = 0
    this.limit = 20
  }
}
