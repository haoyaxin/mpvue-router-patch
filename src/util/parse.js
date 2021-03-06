/* @flow */
import { stringifyQuery } from './query'

function parseRoute ($mp: any) {
  const _$mp = $mp || {}
  const path = _$mp.appOptions && _$mp.appOptions.path
  const query = _$mp.appOptions && _$mp.appOptions.query
  return {
    path: `/${path}`,
    params: {},
    query: query,
    hash: '',
    fullPath: parseUrl({
      path: `/${path}`,
      query: query
    }),
    name: path && path.replace(/\/(\w)/g, ($0, $1) => $1.toUpperCase())
  }
}

function parseUrl (location: Location) {
  if (typeof location === 'string') return location

  const { path, query } = location
  const queryStr = stringifyQuery(query)

  return `${path}${queryStr}`
}

function location2route (routes, location: Location) {
  console.log(location) //  {path: "/pages/manageCate/index", params: {}}
  let route
  routes.map((r) => {
    if (r.path === location.path) {
      route = r
    }
  })
  return route
}

export {
  parseRoute, parseUrl, location2route
}
