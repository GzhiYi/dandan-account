// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;
const MAX_LIMIT = 50;


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  cloud.updateConfig({
    env: wxContext.ENV
  })
  // 初始化数据库
  const db = cloud.database({
    env: wxContext.ENV
  });
  const _ = db.command;
  // page: 当前页数
  // limit: 当前页面加载的个数
  let { page, limit } = event;
  page = Number.parseInt(page);
  limit = Number.parseInt(limit);
  if (!Number.isInteger(page)) {
    page = DEFAULT_PAGE;
  }
  if (!Number.isInteger(limit)) {
    limit = DEFAULT_LIMIT;
  }

  if (page < DEFAULT_PAGE) {
    page = DEFAULT_PAGE;
  }
  if (limit <= 0) {
    limit = DEFAULT_LIMIT
  }
  // 限制最大加载条数
  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }
  try {
    // 分页偏移量公式: (page - 1) * limit
    // 计算偏移量
    let offset = (page - 1) * limit;

    // 主页, 基本列表查询
    if (event.mode === 'normal') {
      // 计算总数
      const totalCount = await db.collection("DANDAN_NOTE")
        .where({
          isDel: false,
          openId: _.eq(wxContext.OPENID),
        }).count();
      // 总数为0, 直接返回
      if (totalCount.total <= 0) {
        return {
          code: 1,
          data: {
            page: [],
            count: totalCount.total,
          },
          message: '获取记录成功',
        }
      }

      // 开始查询
      const res = await db.collection("DANDAN_NOTE")
        .where({
          isDel: false,
          openId: _.eq(wxContext.OPENID),
        })
        .skip(offset)
        .limit(limit)
        .orderBy("createTime", "desc")
        .get();

      // 遍历结果, 获取对应的菜单
      for (let note of res.data) {
        await getCategory(note);
      }

      return {
        code: 1,
        data: {
          page: res,
          count: totalCount.total,
        },
        message: '获取记录成功',
      }
    }
    const res = await db.collection("DANDAN_NOTE")
    .where({
      isDel: false,
      openId: _.eq(wxContext.OPENID),
    }).get()
    return {
      code: 1,
      data: res,
      message: '获取记录成功'
    }

    // 按时间查找
    if (event.mode == 'getAccountListByTime') {
      // ...
    }

  } catch (e) {
    console.error(e);
    return {
      code: -1,
      data: {
        page: [],
        count: 0,
      },
      message: '获取记录失败'
    }
  }

}

async function getCategory(note) {
  const tempCategory = await db.collection("DANDAN_NOTE_CATEGORY").doc(note.categoryId).field({
    categoryIcon: true,
    categoryName: true,
    _id: true
  }).get();
  console.log(tempCategory);
  // 貌似没有记录的话, 就直接被catch掉了
  if (tempCategory.data != null) {
    note.category = tempCategory.data;
  }
}
