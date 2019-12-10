// miniprogram/pages/onboarding/onboarding.js
Page({
  data: {
    step: 1,
  },
  next() {
    const { step } = this.data
    if (Number(step) === 6) {
      wx.redirectTo({
        url: '/pages/tab/tab',
      })
      wx.setStorageSync('isOnboarding', 'v3.5.0')
    } else {
      wx.vibrateShort()
      this.setData({
        step: step + 1,
      })
    }
  },
})
