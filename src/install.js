/* @flow */

import { parseRoute, location2route } from './util/parse'
declare var wx: Object

export let _Vue

export function install (Vue: Object) {
  if (this.installed && _Vue === Vue) return
  this.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined
  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    onShow () {
      if (this.$parent) return
      // _router.app = this
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)
        const { $mp } = this.$root
        this._router.current = location2route(this._router.options.routes, parseRoute($mp))
        Vue.util.defineReactive(this, '_route', this._router.current) // TODO
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
      if (this._router.routeStack.length < 1) {
        this._router.routeStack.push(this._router.current)
      }
    }
  })

  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this.$root._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this.$root._routerRoot._route }
  })
}
