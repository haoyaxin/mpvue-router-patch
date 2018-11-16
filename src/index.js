/* @flow */

import { install } from './install'
import { parseUrl, location2route } from './util/parse'
import { warn, isError } from './util/warn'

declare var wx: Object

export default class VueRouter {
  static install: () => void;
  static version: string;

  app: any;
  apps: Array<any>;
  options: RouterOptions;
  fallback: boolean;
  beforeGuard: NavigationGuard;
  current: Route;
  routeStack: Array<Route>

  constructor (options: RouterOptions = {}) {
    this.app = null
    this.apps = []
    this.options = options
  }

  get currentRoute (): ?Route {
    return this.current
  }

  init (app: any /* Vue component instance */) {
    this.apps.push(app)

    // main app already initialized.
    if (this.app) {
      return
    }

    this.app = app
  }

  beforeEach (fn: NavigationGuard) {
    this.beforeGuard = fn
  }

  abort (err: any) {
    if (isError(err)) {
      // if (this.errorCbs && this.errorCbs.length) {
      //   this.errorCbs.forEach(cb => { cb(err) })
      // } else {
      warn(false, 'uncaught error during route navigation:')
      console.error(err)
      // }
    }
  }

  resolveGuard (to: any, next: Function) {
    this.beforeGuard(to, this.current, (to: any) => {
      if (to === false || isError(to)) {
        this.abort(to)
      } else {
        // confirm transition and pass on the value
        next(to)
      }
    })
  }

  push (location: Location, complete: ?Function, fail: ?Function, success: ?Function) {
    const url = parseUrl(location)
    const params = { url, complete, fail, success }
    let to = location2route(this, location)
    this.resolveGuard(to, (to) => {
      if (location.isTab) {
        wx.switchTab(params)
        return
      }
      if (location.reLaunch) {
        wx.reLaunch(params)
        return
      }
      wx.navigateTo(params)
    })
  }

  replace (location: Location, complete: ?Function, fail: ?Function, success: ?Function) {
    const url = parseUrl(location)
    this.resolveGuard(location, (location) => {
      wx.redirectTo({ url, complete, fail, success })
    })
  }

  go (delta: number) {
    this.resolveGuard(delta, (location) => {
      wx.navigateBack({ delta })
    })
  }

  back () {
    this.resolveGuard(1, (location) => {
      wx.navigateBack()
    })
  }
}

VueRouter.install = install

// _Vue.use(VueRouter)
