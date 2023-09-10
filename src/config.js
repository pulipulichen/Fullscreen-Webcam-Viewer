let appName = 'Fullscreen-Webcam-Viewer'

let config = {
  version: '20230708-1657',

  view: 'main',
  resetLocalConfigHour: 0.5,

  showConfiguration: true,
  showDemo: false,

  powerShellCommand: `iex ((New-Object System.Net.WebClient).DownloadString('https://pulipulichen.github.io/Fullscreen-Webcam-Viewer/assets/share-network.ps1'))`,

  videoObject: null,
  videoSelectedTrack: null,
  videoSelectedTrackIndex: -1,
  videoTrackLabels: [],

  audioStream: null,
  audioTracks: [],

  loadVoteURL: `https://script.google.com/macros/s/AKfycbzuGriN3krNlVJc2C3_sk1-QCypHW9hPDZwJKMStZtC4Ge9GTBb-48qiv82J1-HSw-E/exec`,
  voteSheetURL: 'https://docs.google.com/spreadsheets/d/1_-YWGghERf7pM3pQw9po6E7TEfjatnYLaQKUSyp2xKE/edit#gid=0',
  voterAppURL: `https://pulipulichen.github.io/PWA-Online-Voting/`,

  levelupThreshold: 50
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