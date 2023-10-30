let localConfig = {
  lastChanged: null,
  voteColumnWidth: 200,
  showConfiguration: true,
  showQRCode: true,

  levelupThreshold: 100,
  levelupThresholdRangeMin: -50,
  levelupThresholdRangeMax: 50
}

// ----------------------------------------------------------------

let localConfigEnv = {
  locale: 'zh-TW'
}

for (let name in localConfigEnv) {
  localConfig[name] = localConfigEnv[name]
}

export default localConfig