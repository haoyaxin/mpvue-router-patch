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
    this.routeStack = []
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
      warn(false, 'uncaught error during route navigation:')
      console.error(err)
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

  /**
   * handle route：
   * 1. wx route
   * 2. change route stack
   * 3. change current route
   * */
  push (location: Location, complete: ?Function, fail: ?Function, success: ?Function) {
    const url = parseUrl(location)
    const params = { url, complete, fail, success }
    let to = location2route(this, location)
    this.resolveGuard(to, (to) => {
      if (location.isTab) {
        wx.switchTab(params)
        this.current = to
        this.routeStack.splice(this.routeStack.length - 1, 1, to)
        return
      }
      if (location.reLaunch) {
        wx.reLaunch(params)
        // current & routestack dont need change
        return
      }
      wx.navigateTo(params)
      this.current = to
      this.routeStack.push(to)
    })
  }

  replace (location: Location, complete: ?Function, fail: ?Function, success: ?Function) {
    const url = parseUrl(location)
    let to = location2route(this, location)
    this.resolveGuard(to, (to) => {
      wx.redirectTo({ url, complete, fail, success })
      this.current = to
      this.routeStack = [to]
    })
  }

  go (delta: number) {
    let to = this.routeStack[this.routeStack - 1 - delta]
    this.resolveGuard(to, (to) => {
      wx.navigateBack({ delta })
      this.routeStack.slice(0, this.routeStack - 1 - delta)
      this.current = this.routeStack[this.routeStack - 1]
    })
  }

  back () {
    this.go(-1)
  }
}

VueRouter.install = install
