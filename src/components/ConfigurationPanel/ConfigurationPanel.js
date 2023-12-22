let app = {
  props: ['db'],
  components: {
    ConfigurationPanelFields: () => import('./ConfigurationPanelFields/ConfigurationPanelFields.vue')
  },
  data () {    
    this.$i18n.locale = this.db.localConfig.locale
    return {
    }
  },
  watch: {
    'db.localConfig.locale'() {
      this.$i18n.locale = this.db.localConfig.locale;
    },
  },
  computed: {
    
  },
  mounted() {
    this.autoDisable()
  },
  methods: {
    autoDisable () {
      if (this.db.localConfig.showConfiguration === false) {
        return false
      }

      setTimeout(() => {
        this.db.localConfig.showConfiguration = false
      }, 2 * 60 * 1000)
    },
  }
}

export default app