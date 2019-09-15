Component({
  externalClasses: ['my-class', 'my-icon-class'],
  options: {
    multipleSlots: true
  },
  properties: {
    bgColor: {
      type: String,
      value: 'rgba(0,0,0,0)'
    },
    showIcons: {
      type: Array
    }
  },
  data: {
    showLoadingIcon: false,
    showBackIcon: false,
    showHomeIcons: false,
    isEscape: getApp().globalData.isEscape,
    showTheme: true
  },
  ready() {
    let {
      statusBarHeight,
      navBarHeight
    } = getApp().globalData
    const { showIcons } = this.data
    this.setData({
      statusBarHeight,
      navBarHeight,
      showBackIcon: showIcons.includes('back'),
      showHomeIcons: showIcons.includes('home'),
      showTheme: [1, 2, 3, '1', '2', '3'].includes(wx.getStorageSync('openCount'))
    })
  },
  attached() {
  },
  methods: {
    back() {
      wx.navigateBack({
        delta: 1,
        fail(error) {
          wx.redirectTo({
            url: '/pages/tab/tab',
          })
        }
      })
    },
    goTo(event) {
      const { page } = event.currentTarget.dataset
      wx.navigateTo({
        url: `/pages/${page}/${page}`
      })
    }
  }
})