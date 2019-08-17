Page({
  data: {
    active: 'index'
  },
  goTo(event) {
    const { active } = event.currentTarget.dataset
    this.setData({
      active,
      scale: active
    })
    wx.vibrateShort()
    const self = this
    setTimeout(() => {
      self.setData({
        scale: null
      })
    }, 200)
  }
})