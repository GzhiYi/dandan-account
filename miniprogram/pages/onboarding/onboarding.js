// miniprogram/pages/onboarding/onboarding.js
Page({
  data: {
    step: 1,
  },
  onLoad() {
    // 每一位用户，都需要在onboarding的页面上触发新增用户到USERS表
    this.registerUser()
  },
  registerUser() {
    wx.cloud.callFunction({
      name: 'user',
      data: {
        mode: 'add',
      },
      success(res) {
        // eslint-disable-next-line no-console
        console.log('注册用户返回', res)
      },
    })
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
