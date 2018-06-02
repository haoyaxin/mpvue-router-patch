/* @flow */

import { stringifyQuery } from './util/query'

declare var wx: Object

function parseUrl (location) {
  if (typeof location === 'string') return location

  const { path, query } = location
  const queryStr = stringifyQuery(query)

  return `${path}${queryStr}`
}

function parseRoute ($mp) {
  const _$mp = $mp || {}
  const path = _$mp.page && _$mp.page.route
  return {
    path: `/${path}`,
    params: {},
    query: _$mp.query,
    hash: '',
    fullPath: parseUrl({
      path: `/${path}`,
      query: _$mp.query
    }),
    name: path && path.replace(/\/(\w)/g, ($0, $1) => $1.toUpperCase())
  }
}

function push (location, complete: ?Function, fail: ?Function, success: ?Function) {
  const url = parseUrl(location)
  const params = { url, complete, fail, success }

  if (location.isTab) {
    wx.switchTab(params)
    return
  }
  if (location.reLaunch) {
    wx.reLaunch(params)
    return
  }
  wx.navigateTo(params)
}

function replace (location, complete: ?Function, fail: ?Function, success: ?Function) {
  const url = parseUrl(location)
  wx.redirectTo({ url, complete, fail, success })
}

function go (delta) {
  wx.navigateBack({ delta })
}

function back () {
  wx.navigateBack()
}

export let _Vue

export default {
  install (Vue: Object) {
    if (this.installed && _Vue === Vue) return
    this.installed = true

    _Vue = Vue

    let _route = {}
    const _router: Router = {
      mode: 'history',
      currentRoute: _route,
      push,
      replace,
      go,
      back
    }

    Vue.mixin({
      onShow () {
        if (this.$parent) return
        const { $mp } = this.$root
        _route = parseRoute($mp)
        _router.app = this
      }
    })

    const $router: Property = {
      get () { return _router }
    }
    const $route: Property = {
      get () { return _route }
    }

    Object.defineProperty(Vue.prototype, '$router', $router)

    Object.defineProperty(Vue.prototype, '$route', $route)
  }
}
