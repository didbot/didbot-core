export class Filter {
  public q: string | null
  public from: string | null
  public to: string  | null
  public tag: string | null
  public source: string | null
  public next: string | null
  public previous: string | null

  public reset(): void {
      this.q = null
      this.from = null
      this.to = null
      this.tag = null
      this.source = null
      this.next = null
      this.previous = null
  }
}
