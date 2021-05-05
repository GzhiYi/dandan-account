import { parseTime } from '../../util'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    startDate: '',
    endDate: '',
    name: '',
    minEndDate: parseTime(new Date().getTime() + (86400000 * 2), '{y}-{m}-{d}'),
    randomAvatar: `https://api.multiavatar.com/${Math.ceil(Math.random() * 12230590464)}.svg`,
    nickName: '',
  },
  changeAvatar() {
    this.setData({
      randomAvatar: `https://api.multiavatar.com/${Math.ceil(Math.random() * 12230590464)}.svg`,
    })
  },
  bindDateChange(event) {
    const { key } = event.currentTarget.dataset
    this.setData({
      [`${key}`]: event.detail.value,
    })
  },
  onInput(event) {
    this.setData({
      [`${event.target.dataset.target}`]: event.detail.value,
    })
  },
  checkParams() {
    const { name, startDate, nickName } = this.data
    let errMsg = ''
    if (!name) {
      errMsg = '输入组名'
    } else if (!startDate) {
      errMsg = '选择组账单开始时间'
    } else if (!nickName) {
      errMsg = '需要设置昵称噢'
    }
    if (errMsg) {
      wx.showToast({
        title: errMsg,
        icon: 'none',
      })
      return false
    }
    return true
  },
  confirm() {
    // 验证下数据
    const {
      name,
      nickName,
      startDate,
      endDate,
      randomAvatar,
    } = this.data
    if (this.checkParams()) {
      // 通过
      wx.cloud.callFunction({
        name: 'groupbill',
        data: {
          mode: 'add',
          name,
          startDate,
          endDate,
          nickName,
          avatarUrl: randomAvatar,
        },
        success(res) {
          if (res.result.code === 1) {
            wx.showToast({
              title: '账单组创建成功',
              icon: 'none',
            })
            setTimeout(() => {
              wx.redirectTo({
                url: '/pages/group/group',
              })
            }, 1500)
            getApp().checkHasGroup()
          }
        },
        fail() {
          wx.showToast({
            title: '账单组创建失败，再试试？',
            icon: 'none',
          })
        },
        complete() {
        },
      })
    }
  },
})
