import Vue from 'vue'
import VueNumber from 'vue-number-animation'

Vue.use(VueNumber)

import animationBunny from './animation-list/bunny-rabbit-usagi-fN4xUMSYESWeF8sZoC.gif'
import animationBunnySmall from './animation-list/bunny-rabbit.gif'
// import animationBunnyHeartLove from './animation-list/heart-love.gif'
import animationBunnyHolidayFestival from './animation-list/holiday-festival2.gif'
// import animationBunnyCute from './molangofficialpage-love-cute-5bdhq6YF0szPaCEk9Y.gif'
import animationBunnyRabbitChasingCarrot from './animation-list/rabbit-chasing-carrot.gif'
// import animationBunnyWhiteRabbit from './animation-list/white-rabbit.gif'
import animationJumpBunnyGIFByOliverSin from './animation-list/jump-bunny-gif-by-oliver-sin.gif'
import animationJumpConfusedBunny from './animation-list/confused-bunny.gif'
import animationHappyBunnyRabbitGifByLisaVertudaches from './animation-list/happy-bunny-rabbit-gif-by-lisa-vertudaches.gif'
import animationEasterBunnyIllustrationGifByEmiliaDesert from './animation-list/easter-bunny-illustration-gif-by-emilia-desert.gif'

let app = {
  props: ['db'],
  components: {
    // DataTaskManager: () => import(/* webpackChunkName: "components/DataTaskManager" */ './DataTaskManager/DataTaskManager.vue')
  },
  data () {    
    this.$i18n.locale = this.db.localConfig.locale
    return {
      vote: 0,
      voteClass: null,
      refreshSeconds: 5,
      showLevelup: false,
      lastLevelupRemainder: 0,
      levelupCounter: 0,
      levelupThresholdCurrent: 0,
      levelupAnimationList: [
        animationBunny,
        animationBunnySmall,
        animationBunnyRabbitChasingCarrot,
        animationBunnyHolidayFestival,
        // animationBunnyWhiteRabbit,
        animationJumpBunnyGIFByOliverSin,
        animationJumpConfusedBunny,
        animationHappyBunnyRabbitGifByLisaVertudaches,
        animationEasterBunnyIllustrationGifByEmiliaDesert
      ]
    }
  },
  watch: {
    'db.localConfig.locale'() {
      this.$i18n.locale = this.db.localConfig.locale;
    },
    vote (newVote, oldVote) {
      // console.log(newVote, oldVote)
      let interval = newVote - oldVote

      let levelupRemainder = newVote % this.levelupThresholdCurrent
      // console.log(this.db.localConfig.levelupThreshold)
      if (levelupRemainder < this.lastLevelupRemainder) {
        this.showLevelup = true
      }
      this.lastLevelupRemainder = levelupRemainder

      let className = 'increasing-small'
      if (interval > 5) {
        className = 'increasing-large'
      }
      
      this.voteClass = className
    },
    voteClass () {
      if (this.voteClass) {
        setTimeout(() => {
          this.voteClass = null
        }, 1500 )
      }
    },
    showLevelup () {
      if (this.showLevelup === true) {
        // console.log('showLevelup')
        this.levelupCounter++
        this.changeLevelupThresholdCurrent()
        setTimeout(() => {
          this.showLevelup = false
        }, 5000 )
      }
    },
  },
  computed: {
    voteSheetURL () {
      return this.db.config.voteSheetURL
    },
    voterAppURL () {
      return this.db.config.voterAppURL
    },
    computedVoteClasses () {
      return [this.voteClass]
    },
    computedDuration () {
      if (this.voteClass === 'increasing-large') {
        return 1
      }
      return 0.1
    },
    computedAnimationSrc () {
      let i = this.levelupCounter % this.levelupAnimationList.length
      return this.levelupAnimationList[i]
    }
  },
  mounted() {
    // this.initTest()
    this.init()
  },
  methods: {
    initTest () {
      let count = 0
      setInterval(() => {
        let plus = 1
        if (count % 5 === 0) {
          plus = 10
        }
        else if (count % 3 === 0) {
          plus = 5
        }
        count++
        this.vote = this.vote + plus
      }, this.refreshSeconds * 1000 )
    },
    init: async function () {
      setInterval(async () => {
        if (this.db.config.showDemo) {
          this.vote = this.utils.DataUtils.randomBetween(500, 3000)
          return true
        }

        this.vote = await this.loadVote()
      }, this.refreshSeconds * 1000 )
      this.vote = await this.loadVote()
      this.shuffleAnimationList()
      this.changeLevelupThresholdCurrent()

      // setInterval(() => {
      //   this.levelupCounter++
      // }, 3000)
    },
    testLevelupAnimation () {
      this.levelupCounter++
    },
    shuffleAnimationList () {
      let array = this.levelupAnimationList
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      this.levelupAnimationList = array
    },
    loadVote: async function () {
      
      let url = this.db.config.loadVoteURL
      return await this.db.utils.AxiosUtils.get(url)
    },
    popup (url) {
      this.db.utils.PopupUtils.openURLFullscreen(url)
    },
    changeLevelupThresholdCurrent () {
      let interval = Math.floor(Math.random() * (parseInt(this.db.localConfig.levelupThresholdRangeMax) - parseInt(this.db.localConfig.levelupThresholdRangeMin) + 1)) + parseInt(this.db.localConfig.levelupThresholdRangeMin)

      this.levelupThresholdCurrent = this.db.localConfig.levelupThreshold + interval
      if (this.levelupThresholdCurrent <= 0) {
        this.levelupThresholdCurrent = Math.round(this.db.localConfig.levelupThreshold / 10)
      }
      console.log(this.levelupThresholdCurrent)
    }
  }
}

export default app