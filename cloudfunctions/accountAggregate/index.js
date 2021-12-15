// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event) => {
  const wxContext = cloud.getWXContext()

  cloud.updateConfig({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV
  })
  // 初始化数据库
  const db = cloud.database({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV
  })

  const _ = db.command

  const $ = db.command.aggregate
  const {
    mode, startDate, endDate, OPENID
  } = event

  try {
    // 要显示的字段
    const basicProject = {
      _id: 0,
      money: 1,
      isDel: 1,
      openId: 1,
      flow: 1,
      categoryId: 1,
      isTarget: $.and([
        $.gte([$.dateToString({
          date: '$noteDate',
          format: '%Y-%m-%d',
          timezone: 'Asia/Shanghai'
        }), startDate]),
        $.lte([$.dateToString({
          date: '$noteDate',
          format: '%Y-%m-%d',
          timezone: 'Asia/Shanghai'
        }), endDate])
      ])
    }

    // 先查询是否有组
    const basicOpenId = [OPENID || wxContext.OPENID]

    // 按时间聚合, 聚合出支出和收入的数据
    if (mode === 'aggregateAccountByDateRange') {
      const basicMatch = {
        isDel: false,
        openId: _.in(basicOpenId),
        isTarget: true
      }

      const sumResult = await db.collection('DANDAN_NOTE')
        .aggregate()
        .project(basicProject)
        .match(basicMatch)
        .group({
          _id: '$flow',
          allSum: $.sum('$money'),
          count: $.sum(1)
        })
        .end()
      return {
        code: 1,
        sumResult: sumResult.list.sort((a, b) => a._id - b._id)
      }
    }

    // 获取饼图数据
    if (mode === 'getPieChartData') {
      const basicMatch = {
        isDel: false,
        openId: _.in(basicOpenId),
        isTarget: true
      }

      const detailResult = await db.collection('DANDAN_NOTE')
        .aggregate()
        .project(basicProject)
        .match(basicMatch)
        .group({
          _id: {
            categoryId: '$categoryId',
            flow: '$flow'
          },
          allSum: $.sum('$money'),
          count: $.sum(1)
        })
        .replaceRoot({
          newRoot: $.mergeObjects(['$_id', '$$ROOT'])
        })
        .project({
          _id: 0
        })
        // 查子目录的信息, 以此获取父目录的ID
        .lookup({
          from: 'DANDAN_NOTE_CATEGORY',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryInfo'
        })
        .replaceRoot({
          newRoot: $.mergeObjects([$.arrayElemAt(['$categoryInfo', 0]), '$$ROOT'])
        })
        .project({
          allSum: 1,
          count: 1,
          flow: 1,
          _id: 0,
          fatherCategoryId: '$parentId'
        })
        // 已经得到parentId, 可以再次进行聚合
        .group({
          _id: {
            categoryId: '$fatherCategoryId',
            flow: '$flow'
          },
          allSum: $.sum('$allSum'),
          count: $.sum('$count')
        })
        .replaceRoot({
          newRoot: $.mergeObjects(['$_id', '$$ROOT'])
        })
        .project({
          _id: 0
        })
        // 用父目录ID查询父目录信息
        .lookup({
          from: 'DANDAN_NOTE_CATEGORY',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'fatherCategoryInfo'
        })
        .replaceRoot({
          newRoot: $.mergeObjects([$.arrayElemAt(['$fatherCategoryInfo', 0]), '$$ROOT'])
        })
        .project({
          _id: 0,
          allSum: 1,
          count: 1,
          flow: 1,
          categoryId: 1,
          categoryName: 1
        })
        .end()

      const returnObj = {}

      const flowOutList = []
      const flowInList = []
      let sumAllIn = 0
      let sumAllOut = 0
      // 遍历获取每个流的总金额
      // eslint-disable-next-line no-restricted-syntax
      for (const item of detailResult.list) {
        if (item.flow === 1) {
          // eslint-disable-next-line no-use-before-define
          sumAllIn = keepTwoDecimal(sumAllIn + item.allSum)
          flowInList.push(item)
        } else {
          // eslint-disable-next-line no-use-before-define
          sumAllOut = keepTwoDecimal(sumAllOut + item.allSum)
          flowOutList.push(item)
        }
      }
      returnObj.flowIn = {
        allSum: sumAllIn,
        dataList: flowInList
      }
      returnObj.flowOut = {
        allSum: sumAllOut,
        dataList: flowOutList
      }

      return {
        code: 1,
        detailResult: returnObj
      }
    }
  } catch (e) {
    return {
      code: 0
    }
  }
}

function keepTwoDecimal(num) {
  let result = parseFloat(num)
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(result)) {
    return false
  }
  result = Math.round(num * 100) / 100
  return result
}
