// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 最多获取100条, 如果要获取100条, 则输入110
// TODO: 官方的聚合操作BUG, 默认少了10, 即输入110会变成100
const FAKE_MAX_LIMIT = 110;
// 这让人窒息的操作
const MAX_LIMIT = (FAKE_MAX_LIMIT - 10);

// 云函数入口函数
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext();
  cloud.updateConfig({
    env: process.env.ENV === 'release' ? 
      'release-wifo3' : wxContext.ENV
  })
  // 初始化数据库
  const db = cloud.database({
    env: process.env.ENV === 'release' ?
     'release-wifo3' : wxContext.ENV
  });

  const $ = db.command.aggregate;
  const { mode, startDate, endDate, flow, categoryId } = event;

  // 根据日期范围获取聚集金额总数
  if (mode === 'aggregateAccountByDateRange') {
    // FIXME: 目前版本是聚合不支持使用date, 后期官方更新之后, 可以有更好的写法
    const totalCountResult = await db.collection("DANDAN_NOTE")
      .aggregate()
      .project({
        _id: 0,
        money: 1,
        isDel: 1,
        openId: 1,
        flow: 1,
        noteDate: 1,
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
      })
      .match({
        isDel: false,
        openId: $.eq(wxContext.OPENID),
        isTarget: true,
      })
      .count("totalCount")
      .end();

    let totalCount = 0;
    if (totalCountResult.list.length > 0) {
      totalCount = totalCountResult.list[0].totalCount;
    }

    let batchTime = Math.ceil(totalCount / (MAX_LIMIT));

    console.log("totalCount: ", totalCount, ", and each max is: ", MAX_LIMIT
     , ",so the batch time is: ", batchTime);

    let flowIn = 0;
    let flowOut = 0;

    for (let i = 0; i < batchTime; i++) {
    
      const result = await db.collection("DANDAN_NOTE")
        .aggregate()
        // FIXME: 让人绝望的写法, 没法子, 太多BUG, 跑一次就知道为什么了
        .skip(i === 0 ? i * MAX_LIMIT : (i * MAX_LIMIT) + 10)
         // FIXME: 让人绝望的写法, 没法子, 太多BUG, 跑一次就知道为什么了
        .limit(i === 0 ? FAKE_MAX_LIMIT : MAX_LIMIT) 
        .project({
          _id: 0  ,
          mark: 1,
          money: 1,
          isDel: 1,
          openId: 1,
          flow: 1,
          noteDate: 1,
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
        })
        .match({
          isDel: false,
          openId: $.eq(wxContext.OPENID),
          isTarget: true,
        })
        .group({
          _id: '$flow',
          sumMoney: $.sum('$money')
        })
        .end();

      for (const item of result.list) {
        if (item._id === 0) {
          flowOut += item.sumMoney;
        } else if (item._id === 1) {
          flowIn += item.sumMoney;
        }
      }
    }
    console.log("流入: ", flowIn);
    console.log("支出: ", flowOut);
    return {
      flowIn: flowIn,
      flowOut: flowOut,
      startDate: startDate,
      endDate: endDate,
    }
  }

  
}