import { debounce } from '../../util'

const { importStore } = getApp()
const { create, store } = importStore
create.Page(store, {
  data: {
    canSubscribe: false,
    status: null,
    isChangeing: false,
    showAuthDialog: false,
    isExporting: false,
    canExport: false,
    donateList: [],
  },
  onLoad() {
    if (wx.requestSubscribeMessage) {
      this.setData({
        canSubscribe: true,
      })
    }
    this.getUserSucscribeStatus()
    this.getDonateData()
  },
  onShow() {
    // getApp().checkHasGroup()
  },
  changeNotify: debounce(function () {
    const self = this
    const {
      status,
    } = this.data
    if (this.data.canSubscribe) {
      self.setData({
        isChangeing: true,
      })
      if (!status) {
        wx.requestSubscribeMessage({
          tmplIds: ['29PkwuWSDZ5qCe_bjIAYE8UPbw4A7HIXL_ZNmNCD__s'],
          success(res) {
            if (res.errMsg === 'requestSubscribeMessage:ok') {
              // 如果订阅成功，则修改状态
              self.changeStatus('open')
            }
          },
          fail() {
            self.setData({
              showAuthDialog: true,
            })
            self.changeStatus('close')
          },
        })
      } else {
        self.changeStatus('close')
      }
    } else {
      wx.showToast({
        title: '你的微信版本过低不能订阅哦～',
        icon: 'none',
      })
    }
  }, 600, true),
  changeStatus(type) {
    const self = this
    wx.cloud.callFunction({
      name: 'checkSubscribe',
      data: {
        mode: 'post',
        type,
      },
      success(res) {
        if (res.result.code === 1) {
          setTimeout(() => {
            wx.showToast({
              title: type === 'open' ? '开启订阅成功' : '关闭订阅成功',
              icon: 'none',
            })
          }, 1000)
        }
      },
      complete() {
        self.getUserSucscribeStatus()
        self.setData({
          isChangeing: false,
        })
      },
    })
  },
  getUserSucscribeStatus() {
    const self = this
    wx.cloud.callFunction({
      name: 'checkSubscribe',
      data: {
        mode: 'get',
      },
      success(res) {
        if (res.result.code === 1) {
          self.setData({
            status: res.result.data,
          })
        }
      },
    })
  },
  openSetting() {
    const self = this
    wx.openSetting({
      success() {
        self.setData(({
          showAuthDialog: false,
        }))
      },
    })
  },
  closeDialog() {
    this.setData({
      showAuthDialog: false,
    })
  },
  copyLink() {
    wx.setClipboardData({
      data: 'https://github.com/GzhiYi/dandan-account',
      success() { },
    })
  },
  onExportFile: debounce(function () {
    const self = this
    self.setData({
      isExporting: true,
    })
    wx.cloud.callFunction({
      name: 'exportFile',
      data: {},
      success(res) {
        if (res.result.code === 1) {
          wx.cloud.getTempFileURL({
            fileList: [res.result.data.fileID],
            success: (tempRes) => {
              // eslint-disable-next-line no-console
              console.log(tempRes.fileList)
              wx.setClipboardData({
                data: tempRes.fileList[0].tempFileURL,
                success() { },
              })
            },
          })
        }
      },
      complete() {
        self.setData({
          isExporting: false,
        })
      },
    })
  }, 1000, true),
  showPreview() {
    wx.previewImage({
      current: 'https://6461-dandan-zdm86-1259814516.tcb.qcloud.la/WechatIMG11.jpeg?sign=bdaed572942b8bc2e7b3a61f7183d743&t=1576081688', // 当前显示图片的http链接
      urls: ['https://6461-dandan-zdm86-1259814516.tcb.qcloud.la/WechatIMG12.jpeg?sign=75331a3836c6eee63305ce5dbed48909&t=1576082500'], // 需要预览的图片http链接列表
    })
  },
  getDonateData() {
    const self = this
    wx.cloud.callFunction({
      name: 'donate',
      data: {
        mode: 'get',
      },
      success(res) {
        self.setData({
          donateList: res.result.data,
        })
      },
    })
  },
  showWord(event) {
    const { word } = event.currentTarget.dataset.item
    if (word) {
      wx.showToast({
        title: word,
        icon: 'none',
      })
    }
  },
  goToGroupBill() {
    const { myGroup } = store.data
    if (myGroup._id) {
      wx.navigateTo({
        url: '/pages/group/group',
      })
    } else {
      wx.navigateTo({
        url: '/pages/group-bill-set/group-bill-set',
      })
    }
  },
})
