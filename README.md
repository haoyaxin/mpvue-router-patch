# mpvue-router
> 在 mpvue 中使用 vue-router 兼容的路由写法，从mpvue-router-patch项目fork过来，增加了简单的路由守卫和路由栈管理

## 安装

没有丢进npm，所以可以自行下载dist里的文件丢进小程序项目中使用

## 使用

设置项目所需路由
``` js
// routes,js
const routes = [
  {
    path: '/pages/login/index',
    config: {
      navigationBarTitleText: '登录',
      usingComponents: {}
    }
  },
  {
    path: '/pages/index/index',
    meta: {requireAuth: true},
    config: {
      navigationBarTitleText: '首页',
      usingComponents: {}
    }
  }
]

// router.js
import Router from './xrouter'
import routes from './routes'

const router = new Router({routes})
```

路由守卫示例：
``` js
// router.js
router.beforeEach(async (to, from, next) => {
  // meta.requireAuth为true时才进行校验
  if (to.meta && to.meta.requireAuth) {
    // 此处使用vuex进行校验，具体根据业务需求来
    try {
      await store.dispatch('user/checkAuth')
      next(to)
    } catch (e) {
      // replace表示要重定向到心得页面
      next({path: '/pages/login/index', replace: true})
    }
  } else {
    next(to)
  }
})

```

将router注入vue
``` js
// main.js
import xRouter from '@/router/xrouter'
import router from '@/router/routes'

Vue.use(xRouter)

const app = new Vue({
  router,
  store,
  ...App
})

app.$mount()
```

## API

> 支持以下列出的方法及属性

### Router 实例

#### 属性

* $router.app

当前页面的 Vue 实例

* $router.mode

路由使用的模式，固定值 `history`

* $router.currentRoute

当前路由对应的路由信息对象，等价于 $route

#### 方法

* $router.push(location, onComplete?, onAbort?, onSuccess?)

跳转到应用内的某个页面，`wx.navigateTo`、`wx.switchTab` 及 `wx.reLaunch` 均通过该方法实现，`location` 参数对象形式，跳转至 `tabBar` 页面或重启至某页面时必须以对象形式传入

``` js

// 对象
router.push({ path: '/pages/news/detail' })

// 带查询参数，变成 /pages/news/detail?id=1
router.push({ path: '/pages/news/detail', query: { id: 1 } })

// 切换至 tabBar 页面  TODO
router.push({ path: '/pages/news/list', isTab: true })

// 重启至某页面，无需指定是否为 tabBar 页面，但 tabBar 页面无法携带参数
router.push({ path: '/pages/news/list', reLaunch: true })
```

* $router.replace(location, onComplete?, onAbort?, onSuccess?)

关闭当前页面，跳转到应用内的某个页面，相当于 `wx.redirectTo`，`location` 参数格式与 `$router.push` 相似，不支持 `isTab` 及 `reLaunch` 属性

* $router.go(n)

关闭当前页面，返回上一页面或多级页面，`n` 为回退层数，默认值为 `1`

* $router.back()

关闭当前页面，返回上一页面

### 路由信息对象

#### 属性

* $route.path

字符串，对应当前路由的路径，总是解析为绝对路径，如 `/pages/news/list`

* $route.query

一个 key/value 对象，表示 URL 查询参数。例如，对于路径 `/pages/news/detail?id=1`，则有 `$route.query.id == 1`，如果没有查询参数，则是个空对象。

* $route.fullPath

完成解析后的 URL，包含查询参数和 hash 的完整路径

* $route.name
// TODO
当前路由的名称，由 `path` 转化而来
