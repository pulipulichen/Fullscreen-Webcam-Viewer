/* global __webpack_public_path__ */
import Vue from 'vue'


// ----------------------------------
// plugins

import i18n from './i18n/i18n.js'

// ----------------------

import './styles/styles.js'
import template from './index.tpl'
import config from './config.js'
import localConfig from './local-config.js'
import utils from './utils/utils.js'
import $ from 'jquery'

// --------------------
// Components or routes

//import components from './components/index.js'
import Index from './components/Index.vue'


import VueRouter from 'vue-router'
Vue.use(VueRouter)

const routes = [
  { 
    path: '/', 
    component: Index 
  },
  { 
    path: '/:view', 
    component: Index,
    props: true
  },
  { 
    path: '/:view/:search', 
    component: Index,
    props: true
  },
]

const router = new VueRouter({
  // mode: "history",
  mode: "hash",
  routes, // `routes: routes` 的缩写
})

// -----------------------
// 確認 baseURL

let baseURL = __webpack_public_path__
baseURL = baseURL.split('/').slice(0, 3).join('/')

let baseScript = document.currentScript
if (baseScript) {
  
  let src = baseScript.src
  //console.log(src)
  if (src.startsWith('/')) {
    src = window.location.href
    console.log(src)
  }
  else {
    baseURL = src.split('/').slice(0, 3).join('/')
  }
  //console.log(baseURL)
  //if (enableBrowserTest && baseScript[0].src.startsWith(testBaseURL)) {
  //if (enableBrowserTest) {
  //}
  
  
  let appNode = document.createElement("div");
  appNode.id = 'app'
  baseScript.parentNode.insertBefore(appNode, baseScript);
  //baseScript.before(`<div id="app"></div>`)
}
config.baseURL = baseURL

// ---------------
// 錯誤訊息的設置

window.onerror = function(message, source, lineno, colno, error) {
  if (error === null) {
    error = message
  }
  console.error(error)
  VueController.data.errors.push(error)
}

Vue.config.errorHandler  = function(err, vm, info) {
  //console.log(`errorHandler Error: ${err.stack}\nInfo: ${info}`);
  console.error(err)
  VueController.data.errors.push(err)
}

// -----------------------

let VueController = {
  el: '#app',
  template: template,
  data: {
    db: {
      config: config,
      localConfig: localConfig,
      defaultLocalConfig: JSON.parse(JSON.stringify(localConfig)),
      utils: utils,
    },
    errors: [],
  },
  i18n: i18n,
  components: {
    Index
  },
  router,
  computed: {
    appName () {
      let cacheKey = this.db.config.appName

      let id = this.db.utils.URLUtils.getParameterID()
      if (id) {
        cacheKey = cacheKey + `_` + id
      }
      else if (window.location != window.parent.location) {
        let url = (window.location != window.parent.location)
                  ? document.referrer
                  : document.location.href;
        // console.log(url, window.location, window.parent.location, document.referrer, document.location.href)
        if (url) {
          cacheKey = cacheKey + '_' + url
        }
      }

      this.db.config.appNameID = cacheKey

      return cacheKey
    },
  },
  watch: {},
  mounted: async function () {
    //console.log('index.js mounted', 1)
    this.db.config.openFromAPI = (location.href.endsWith('api=1'))
    
    this.restoreFromLocalStorage()
    this.initLocalConfigReset()
    //console.log('index.js mounted', 2)
    
    await this.waitForSemanticUIReady()
    
    //console.log('index.js mounted', 3)
    
    this.db.config.inited = true
  },
  methods: {
    waitForSemanticUIReady: async function () {
      let $body = $('body')
      while (typeof($body.modal) !== 'function') {
        await this.db.utils.AsyncUtils.sleep()
      }
      return true
    },

    restoreFromLocalStorage () {
      if (this.db.config.debug.enableRestore === false || 
          this.db.config.openFromAPI) {
        return false
      }

      // console.log(this.appName)
      let data = localStorage.getItem(this.appName)
      //console.log(data)
      if (data === null || data.startsWith('{') === false || data.endsWith('}') === false) {
        return false
      }

      try {
        data = JSON.parse(data)
      } catch (e) {
        console.error(e)
      }

      //console.log(data)
      for (let key in data) {
        this.db.localConfig[key] = data[key]
      }
    },
    saveToLocalStorage () {
      if (this.db.config.inited === false) {
        return false
      }

      let data = this.db.localConfig
      // console.log(this.appName)
      // console.log(data)
      data = JSON.stringify(data)
      //console.log(data)
      localStorage.setItem(this.appName, data)

      if (this.db.config.resetLocalConfigHour) {
        this.db.localConfig.lastChanged = (new Date()).getTime()
      }
    },

    initLocalConfigReset: function () {
      if (!this.db.config.resetLocalConfigHour || 
        !this.db.localConfig.lastChanged) {
        return false
      }

      let currentTime = (new Date()).getTime()
      let intervalTime = currentTime - this.db.localConfig.lastChanged

      if (intervalTime < (this.db.config.resetLocalConfigHour * 60 * 60 * 1000)) {
        return false
      }

      for (let key in localConfig) {
        this.db.localConfig[key] = this.db.defaultLocalConfig[key]
      }
      // console.log(this.db.defaultLocalConfig)
      // console.log('重置')
    }
  }
}

// ----------------------------

for (let key in localConfig) {
  //console.log(key)
  if (key === 'lastChanged') {
    continue
  }

  VueController.watch['db.localConfig.' + key] = {
    handler: function () {
      this.saveToLocalStorage()
    },
    deep: true
  }
}

// ----------------------------

if (typeof(baseURL) === 'string') {
  setTimeout(() => {
    window.vueApp = new Vue(VueController)
  }, 0)
}

import './service-worker-loader.js'