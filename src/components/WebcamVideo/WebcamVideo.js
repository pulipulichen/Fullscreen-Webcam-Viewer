let app = {
  props: ['db'],
  components: {
    // DataTaskManager: () => import(/* webpackChunkName: "components/DataTaskManager" */ './DataTaskManager/DataTaskManager.vue')
  },
  data () {    
    this.$i18n.locale = this.db.localConfig.locale
    return {
      width: 0,
      height: 0,
    }
  },
  watch: {
    'db.localConfig.locale'() {
      this.$i18n.locale = this.db.localConfig.locale;
    },
    'db.config.videoSelectedTrackDevicesID' () {
      // console.log(this.db.config.videoSelectedTrackIndex)
      // console.log(this.db.config.videoObject)
      this.init()
    },
  },
  computed: {
    computedStyle () {
      return {
        width: this.width + 'px',
        height: this.height + 'px',
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.init()
    }, 500)
      
  },
  methods: {
    init: async function () {
      // console.log(this.db.config.videoObject, this.$refs.Video)
      if (!this.db.config.videoObject ||
        !this.$refs.Video ) {
        return false
      }

      // let index = this.db.config.videoSelectedTrackIndex
      // let track = this.db.config.videoObject.getTracks()[index];
      let videoObject = await navigator.mediaDevices.getUserMedia({ video: { deviceId: this.db.config.videoSelectedTrackDevicesID } })
      let track = videoObject.getTracks()[0]
      console.log(track, this.db.config.videoSelectedTrackDevicesID)
      let video = this.$refs.Video
      video.srcObject = videoObject
      // video = track
      
      if (track.getSettings) {
        let {width, height} = track.getSettings()
        console.log(`${width}x${height}`);
        // video.style.width = width+'px';
        // video.style.height = height+'px'
        this.width = width
        this.height = height

        // $('body').removeClass('allow')
      }
      await new Promise(resolve => video.onloadedmetadata = resolve);
      // playAudioFromUSB()
      console.log(`${video.videoWidth}x${video.videoHeight}`);
    },
    toggleFullscreen (e) {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        return false
      }

      let video = e.target
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } 
      else if (video.mozRequestFullScreen) { 
        video.mozRequestFullScreen();
      } 
      else if (video.webkitRequestFullscreen) { 
        video.webkitRequestFullscreen();
      } 
      else if (video.msRequestFullscreen) { 
        video.msRequestFullscreen();
      }
    }
  }
}

export default app