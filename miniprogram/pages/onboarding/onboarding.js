// miniprogram/pages/onboarding/onboarding.js
Page({
  data: {
    step: 1
  },
  next() {
    const { step } = this.data
    if (step == 6) {
      wx.redirectTo({
        url: '/pages/tab/tab'
      })
    } else {
      this.setData({
        step: step + 1
      })
    }
    
  }
})