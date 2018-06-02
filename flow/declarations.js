declare type Dictionary<T> = { [key: string]: T }

declare type Router = {
  app?: Object,
  currentRoute?: Object,
  mode?: string,
  push: Function,
  replace: Function,
  go: Function,
  back: Function
}

declare type Property = {
  value?: any,
  get?: Function,
  set?: Function
}
