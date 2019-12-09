Page({
  data: {
    canSubscribe: false,
    status: null
  },
  onLoad: function (options) {
    if (wx.requestSubscribeMessage) {
      this.setData({
        canSubscribe: true
      })
    }
    this.getUserSucscribeStatus()
  },
  changeNotify() {
    const self = this
    const { status } = this.data
    if (this.data.canSubscribe) {
      if (!status) {
        wx.requestSubscribeMessage({
          tmplIds: ['29PkwuWSDZ5qCe_bjIAYE8UPbw4A7HIXL_ZNmNCD__s'],
          success(res) {
            console.log('res', res)
            if (res.errMsg === 'requestSubscribeMessage:ok') {
              // 如果订阅成功，则修改状态
              self.changeStatus('open')
            }
          },
          fail(err) {
            wx.showToast({
              title: '由于拒绝订阅，所以将关闭推送',
              icon: 'none'
            })
            self.changeStatus('close')
          }
        })
      } else {
        self.changeStatus('close')
      }
    } else {
      wx.showToast({
        title: '你的微信版本过低不能订阅哦～',
        icon: 'none'
      })
    }
  },
  changeStatus(type) {
    const self = this
    wx.cloud.callFunction({
      name: 'checkSubscribe',
      data: {
        mode: 'post',
        type
      },
      success(res) {},
      complete() {
        self.getUserSucscribeStatus()
      }
    })
  },
  getUserSucscribeStatus() {
    const self = this
    wx.cloud.callFunction({
      name: 'checkSubscribe',
      data: {
        mode: 'get'
      },
      success(res) {
        if (res.result.code === 1) {
          self.setData({
            status: res.result.data
          })
        }
      }
    })
  }
})