Page({
  data: {
    canSubscribe: false
  },
  onLoad: function (options) {
    if (wx.requestSubscribeMessage) {
      this.setData({
        canSubscribe: true
      })
    }
  },
  changeNotify() {
    if (this.data.canSubscribe) {
      wx.requestSubscribeMessage({
        tmplIds: ['29PkwuWSDZ5qCe_bjIAYE8UPbw4A7HIXL_ZNmNCD__s'],
        success(res) {
          console.log('res', res)
          if (res.errMsg === 'requestSubscribeMessage:ok') {
            
          }
        },
        fail(err) {
          console.log('err', err)
        }
      })
    } else {
      wx.showToast({
        title: '你的微信版本过低不能订阅哦～',
        icon: 'none'
      })
    }
  }
})