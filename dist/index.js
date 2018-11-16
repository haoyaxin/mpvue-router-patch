function warn(condition, message) {
  if (process.env.NODE_ENV !== 'production' && !condition) {
    typeof console !== 'undefined' && console.warn(`[mpvue-router-patch] ${message}`);
  }
}

function isError(err) {
  return Object.prototype.toString.call(err).indexOf('Error') > -1;
}

function stringifyQuery(obj) {
  const res = obj ? Object.keys(obj).map(key => {
    const val = obj[key];

    if (val === undefined) {
      return '';
    }

    if (val === null) {
      return key;
    }

    if (Array.isArray(val)) {
      const result = [];
      val.forEach(val2 => {
        if (val2 === undefined) {
          return;
        }
        if (val2 === null) {
          result.push(key);
        } else {
          result.push(`${key}=${val2}`);
        }
      });
      return result.join('&');
    }

    return `${key}=${val}`;
  }).filter(x => x.length > 0).join('&') : null;
  return res ? `?${res}` : '';
}

function parseRoute($mp) {
  const _$mp = $mp || {};
  const path = _$mp.page && _$mp.page.route;
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
  };
}

function parseUrl(location) {
  if (typeof location === 'string') return location;

  const { path, query } = location;
  const queryStr = stringifyQuery(query);

  return `${path}${queryStr}`;
}

function location2route(router, location) {
  let routes = router.options.routes;
  console.log(location); //  {path: "/pages/manageCate/index", params: {}}
  let route;
  routes.map(r => {
    if (r.path === location.path) {
      route = r;
    }
  });
  return route;
}

let _Vue;

function install(Vue) {
  if (this.installed && _Vue === Vue) return;
  this.installed = true;

  _Vue = Vue;

  const isDef = v => v !== undefined;
  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode;
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal);
    }
  };

  Vue.mixin({
    onShow() {
      if (this.$parent) return;
      // _router.app = this
      if (isDef(this.$options.router)) {
        this._routerRoot = this;
        this._router = this.$options.router;
        this._router.init(this);
        const { $mp } = this.$root;
        this._router.current = parseRoute($mp);
        Vue.util.defineReactive(this, '_route', this._router.current); // TODO
      } else {
        this._routerRoot = this.$parent && this.$parent._routerRoot || this;
      }
      registerInstance(this, this);
    }
  });

  Object.defineProperty(Vue.prototype, '$router', {
    get() {
      return this._routerRoot._router;
    }
  });

  Object.defineProperty(Vue.prototype, '$route', {
    get() {
      return this._routerRoot._route;
    }
  });
}

class VueRouter {

  constructor(options = {}) {
    this.app = null;
    this.apps = [];
    this.options = options;
  }

  get currentRoute() {
    return this.current;
  }

  init(app /* Vue component instance */) {
    this.apps.push(app);

    // main app already initialized.
    if (this.app) {
      return;
    }

    this.app = app;
  }

  beforeEach(fn) {
    this.beforeGuard = fn;
  }

  abort(err) {
    if (isError(err)) {
      // if (this.errorCbs && this.errorCbs.length) {
      //   this.errorCbs.forEach(cb => { cb(err) })
      // } else {
      warn(false, 'uncaught error during route navigation:');
      console.error(err);
      // }
    }
  }

  resolveGuard(to, next) {
    this.beforeGuard(to, this.current, to => {
      if (to === false || isError(to)) {
        this.abort(to);
      } else {
        // confirm transition and pass on the value
        next(to);
      }
    });
  }

  push(location, complete, fail, success) {
    const url = parseUrl(location);
    const params = { url, complete, fail, success };
    let to = location2route(this, location);
    this.resolveGuard(to, to => {
      if (location.isTab) {
        wx.switchTab(params);
        return;
      }
      if (location.reLaunch) {
        wx.reLaunch(params);
        return;
      }
      wx.navigateTo(params);
    });
  }

  replace(location, complete, fail, success) {
    const url = parseUrl(location);
    this.resolveGuard(location, location => {
      wx.redirectTo({ url, complete, fail, success });
    });
  }

  go(delta) {
    this.resolveGuard(delta, location => {
      wx.navigateBack({ delta });
    });
  }

  back() {
    this.resolveGuard(1, location => {
      wx.navigateBack();
    });
  }
}

VueRouter.install = install;

// _Vue.use(VueRouter)

export default VueRouter;
