import Vue from 'vue'
import VueNumber from 'vue-number-animation'

Vue.use(VueNumber)

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
      lastLevelupRemainder: 0
    }
  },
  watch: {
    'db.localConfig.locale'() {
      this.$i18n.locale = this.db.localConfig.locale;
    },
    vote (newVote, oldVote) {
      // console.log(newVote, oldVote)
      let interval = newVote - oldVote

      let levelupRemainder = newVote % this.db.config.levelupThreshold
      if (levelupRemainder < this.lastLevelupRemainder) {
        this.showLevelup = true
      }
      this.lastLevelupRemainder = levelupRemainder

      let className = 'increasing-small'
      if (interval >= 5) {
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
        this.vote = await this.loadVote()
      }, this.refreshSeconds * 1000 )
      this.vote = await this.loadVote()
    },
    loadVote: async function () {
      let url = this.db.config.loadVoteURL
      return await this.db.utils.AxiosUtils.get(url)
    },
    popup (url) {
      this.db.utils.PopupUtils.openURLFullscreen(url)
    }
  }
}

export default app