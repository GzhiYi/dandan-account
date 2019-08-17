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
  detached() {
    this.hideLoading()
  },
  methods: {
    back() {
      wx.navigateBack({
        delta: 1,
        fail(error) {
          wx.redirectTo({
            url: '/pages/group/group',
          })
        }
      })
    },
    /**
   * 开始旋转
   */
    showLoading() {
      var that = this;
      this.setData({
        showLoadingIcon: true
      })
    },

    /**
     * 停止旋转
     */
    hideLoading() {
      this.setData({
        showLoadingIcon: false
      })
    },
    goTo(event) {
      const { page } = event.currentTarget.dataset
      wx.navigateTo({
        url: `/pages/${page}/${page}`
      })
    },
    inDev() {
      wx.showToast({
        title: '功能正在开发中...',
        icon: 'none'
      })
    },
    newGroup() {
      getCurrentPages()[0].showNewGroupModal()
    }
  }
})