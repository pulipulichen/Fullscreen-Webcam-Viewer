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
    
  },
  methods: {
  }
}

export default app