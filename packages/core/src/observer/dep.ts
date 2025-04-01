import Watcher from './watcher'

export default class Dep {
  static target: Watcher | null
  private subs: Array<Watcher>

  /**
   * Subscription center constructor
   */
  constructor () {
    this.subs = []
  }

  /**
   * Collect dependencies
   * @param {*} sub 
   */
  public addSub (sub: Watcher) {
    // Temporarily use includes to prevent duplicate additions
    if (!this.subs.includes(sub)) {
      this.subs.push(sub)
    }
  }

  /**
   * Dispatch updates
   */
  public notify () {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}
