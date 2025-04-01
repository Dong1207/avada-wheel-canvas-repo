import Dep from './dep'
import { hasProto, def } from './utils'
import { newArrayProto } from './array'

export default class Observer {
  value: any
  dep: Dep

  /**
   * Observer constructor
   * @param value 
   */
  constructor (value: any) {
    // this.value = value
    this.dep = new Dep()
    // Proxy reactive object to current value and set current enumerable to false
    def(value, '__luckyOb__', this)
    if (Array.isArray(value)) { // If array, override prototype methods
      if (hasProto) {
        value['__proto__'] = newArrayProto
      } else {
        Object.getOwnPropertyNames(newArrayProto).forEach(key => {
          def(value, key, newArrayProto[key])
        })
      }
    }
    this.walk(value)
  }

  walk (data: object | any[]) {
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
}

/**
 * Handle reactivity
 * @param { Object | Array } data
 */
export function observe (data: any): Observer | void {
  if (!data || typeof data !== 'object') return
  let luckyOb: Observer | void
  if ('__luckyOb__' in data) {
    luckyOb = data['__luckyOb__']
  } else {
    luckyOb = new Observer(data)
  }
  return luckyOb
}

/**
 * Override setter / getter
 * @param {*} data 
 * @param {*} key 
 * @param {*} val 
 */
export function defineReactive (data: any, key: string | number, val: any) {
  const dep = new Dep()
  const property = Object.getOwnPropertyDescriptor(data, key)
  if (property && property.configurable === false) {
    return
  }
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = data[key]
  }
  let childOb = observe(val)
  Object.defineProperty(data, key, {
    get: () => {
      const value = getter ? getter.call(data) : val
      if (Dep.target) {
        dep.addSub(Dep.target)
        if (childOb) {
          childOb.dep.addSub(Dep.target)
        }
      }
      return value
    },
    set: (newVal) => {
      if (newVal === val) return
      val = newVal
      if (getter && !setter) return
      if (setter) {
        setter.call(data, newVal)
      } else {
        val = newVal
      }
      childOb = observe(newVal)
      dep.notify()
    }
  })
}
