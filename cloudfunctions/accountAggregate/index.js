// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext();
  console.log("account aggregate env: ", wxContext.ENV)

  cloud.updateConfig({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV
  })
  // 初始化数据库
  const db = cloud.database({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV
  });

  const $ = db.command.aggregate;
  const { mode, startDate, endDate, flow, categoryId, OPENID } = event;

  // 按时间聚合, 聚合出支出和收入的数据
  try {
    if (mode === 'aggregateAccountByDateRange') {
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
      };

      const basicMatch = {
        isDel: false,
        openId: $.eq(OPENID ? OPENID : wxContext.OPENID),
        isTarget: true,
      };

      const sumResult = await db.collection("DANDAN_NOTE")
        .aggregate()
        .project(basicProject)
        .match(basicMatch)
        .group({
          _id: "$flow",
          allSum: $.sum("$money"),
          count: $.sum(1)
        })
        .end();
      return {
        sumResult: sumResult.list.sort((a, b) => a._id - b._id)
      }

      // 根据FLOW流向详细聚合数据
      // if (mode === 'aggregateAccountInDetail') {

      //   const basicProject = {
      //     _id: 0,
      //     money: 1,
      //     isDel: 1,
      //     openId: 1,
      //     flow: 1,
      //     categoryId: 1,
      //     isTarget: $.and([
      //       $.gte([$.dateToString({
      //         date: '$noteDate',
      //         format: '%Y-%m-%d',
      //         timezone: 'Asia/Shanghai'
      //       }), startDate]),
      //       $.lte([$.dateToString({
      //         date: '$noteDate',
      //         format: '%Y-%m-%d',
      //         timezone: 'Asia/Shanghai'
      //       }), endDate])
      //     ])
      //   };

      //   const basicMatch = {
      //     isDel: false,
      //     openId: $.eq(OPENID ? OPENID : wxContext.OPENID),
      //     flow: Number(flow),
      //     isTarget: true,
      //   };

      //   // 求详细的结果, 只涉及到二级目录
      //   const detailResult = await db.collection("DANDAN_NOTE")
      //     .aggregate()
      //     .project(basicProject)
      //     .match(basicMatch)
      //     .group({
      //       _id: '$categoryId',
      //       allSum: $.sum("$money"),
      //       count: $.sum(1),
      //     })
      //     .end();

      //   return {
      //     code: 1,
      //     detailResult: detailResult.list,
      //   }
      // }

      // 根据FLOW流向详细聚合数据
      if (mode === 'aggregateAccountInDetail') {

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
        };

        const basicMatch = {
          isDel: false,
          openId: $.eq(OPENID ? OPENID : wxContext.OPENID),
          flow: Number(flow),
          isTarget: true,
        };

        const detailResult = await db.collection("DANDAN_NOTE")
          .aggregate()
          .project(basicProject)
          .match(basicMatch)
          .group({
            _id: '$categoryId',
            allSum: $.sum("$money"),
            count: $.sum(1),
          })
          // 查子目录的信息, 以此获取父目录的ID
          .lookup({
            from: 'DANDAN_NOTE_CATEGORY',
            localField: '_id',
            foreignField: '_id',
            as: 'categoryInfo',
          })
          .replaceRoot({
            newRoot: $.mergeObjects([$.arrayElemAt(['$categoryInfo', 0]), '$$ROOT'])
          })
          .project({
            allSum: 1,
            count: 1,
            flow: 1,
            _id: 0,
            sonCategoryName: '$categoryName',
            fatherCategoryId: '$parentId',
            sonCategoryId: '$_id'
          })
          // 用父目录ID查询父目录信息
          .lookup({
            from: 'DANDAN_NOTE_CATEGORY',
            localField: 'fatherCategoryId',
            foreignField: '_id',
            as: 'fatherCategoryInfo',
          })
          .replaceRoot({
            newRoot: $.mergeObjects([$.arrayElemAt(['$fatherCategoryInfo', 0]), '$$ROOT'])
          })
          .project({
            _id: 0,
            allSum: 1,
            count: 1,
            flow: 1,
            sonCategoryName: 1,
            sonCategoryId: 1,
            fatherCategoryId: 1,
            fatherCategoryName: '$categoryName',
          })
          // 最后把数据聚合到父目录
          .group({
            _id: '$fatherCategoryId',
            fatherCategoryName: $.first("$fatherCategoryName"),
            allSum: $.sum("$allSum"),
            count: $.sum("$count"),
            sonCategories: $.addToSet("$sonCategoryId"),
          })
          .project({
            _id: 0,
            fatherCategoryId: '$_id',
            fatherCategoryName: 1,
            allSum: 1,
            count: 1,
            flow: 1,
            sonCategories: 1,
          })
          .end();
        return {
          code: 1,
          detailResult: detailResult.list,
        }
      }
    }
  } catch (e) {
    console.error(e)
    return {
      sumResult: sumResult.list.length > 0 ? sumResult.list[0].sort((a, b) => a._id - b._id) : {},
      detailResult: detailResult.list,
    }
  }
}


function keepTwoDecimal(num) {
  var result = parseFloat(num);
  if (isNaN(result)) {
    alert('传递参数错误，请检查！');
    return false;
  }
  result = Math.round(num * 100) / 100;
  return result;
};
