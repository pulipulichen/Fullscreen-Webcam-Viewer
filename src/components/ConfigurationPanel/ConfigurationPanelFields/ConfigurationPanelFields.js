
let app = {
  props: ['db'],
  components: {
    // DataTaskManager: () => import(/* webpackChunkName: "components/DataTaskManager" */ './DataTaskManager/DataTaskManager.vue')
  },
  data () {    
    this.$i18n.locale = this.db.localConfig.locale
    return {
      audioEnabled: false,
      audioDisabledTracks: []
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
    this.init()
    // this.enableAudio()
  },
  methods: {
    init: async function () {
      try {
        let constraints = {video: {width: 9999}};
        this.db.config.videoObject = await navigator.mediaDevices.getUserMedia(constraints);
        let tracks = this.db.config.videoObject.getTracks();
        // console.log(tracks); 
        // let videoSelectedTrack = 0
        this.db.config.videoTrackLabels = []
        for (let i = 0; i < tracks.length; i++) {
          let track = tracks[i]
  
          // if (track.kind !== 'video') {
          //   continue;
          // }
  
          if (track.label.indexOf('USB') > -1) {
            this.db.config.videoSelectedTrack = track.label
            this.db.config.videoSelectedTrackIndex = i
          }
          this.db.config.videoTrackLabels.push(track.label)
  
          // $(`<option value="${i}">${track.label}</option>`).appendTo('#source')
        }

        if (!this.db.config.videoSelectedTrack && 
            this.db.config.videoTrackLabels.length > 0) {
          this.db.config.videoSelectedTrack = this.db.config.videoTrackLabels[0]
        } 
        // console.log(this.db.config.videoSelectedTrack)

      } catch(e) {
        console.log(e);
      }
    },
    reload () {
      location.reload()
    },
    enableAudio () {
      navigator.getUserMedia = navigator.getUserMedia ||navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    
      var aCtx;
      var analyser;
      var microphone;
      if (navigator.getUserMedia) {
        navigator.getUserMedia(
          {audio: true}, 
          (stream) => {
            // console.log(stream)
            // console.log(tracks)
            this.db.config.audioStream = stream
            this.db.config.audioTracks = stream.getAudioTracks()
            // console.log(this.db.config.audioTracks)

            aCtx = new AudioContext();
            microphone = aCtx.createMediaStreamSource(stream);
            var destination = aCtx.destination;
            // console.log(destination)
            microphone.connect(destination);

            this.audioEnabled = true
          },
          () => { console.log("Error 003.")}
        );
      }
    },
    copyCommand () {
      this.db.utils.ClipboardUtils.copyPlainString(this.db.config.powerShellCommand)
    },
    toggleAudioMuted (track) {
      track.enabled = !track.enabled

      if (this.audioDisabledTracks.indexOf(track.label) === -1) {
        this.audioDisabledTracks.push(track.label)
      }
      else {
        this.audioDisabledTracks = this.audioDisabledTracks.filter(t => t !== track.label)
      }
    }
  }
}

export default app