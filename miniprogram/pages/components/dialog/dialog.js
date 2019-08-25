Component({
  options: {
    multipleSlots: true
  },
  properties: {
    visible: {
      type: Boolean,
      value: false
    }
  },
  data: {
  },
  ready() {
  },
  attached() {
  },
  methods: {
    closeDialog() {
      this.setData({
        visible: false
      })
      this.triggerEvent('closeDialog')
    }
  }
})