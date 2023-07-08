let appName = 'Fullscreen-Webcam-Viewer'

let config = {
  version: '20230708-1657',

  view: 'main',
  resetLocalConfigHour: 0.5,

  showConfiguration: false,
  tracks: []
}

// ----------------------------------------------------------------

let configEnv = {
  appName,
  appNameID: appName,
  debug: {
    ErrorHandler: {
      verbose: true
    },
    enableRestore: true,
  },
  
  inited: false,
  urlGithub: `https://github.com/pulipulichen/${appName}/`,
  urlIssue: `https://github.com/pulipulichen/${appName}/issues/new`,
  
}

for (let name in configEnv) {
  config[name] = configEnv[name]
}

import styleConfig from './styles/style.config.js'
config.styleConfig = styleConfig

//import readingConfig from './../config/reading.js'
//config.readingConfig = readingConfig

import productionConfig from './config.production.js'
if (process.env.NODE_ENV === 'production') {
  for (let name in productionConfig) {
    config[name] = productionConfig[name]
  }
}

export default config