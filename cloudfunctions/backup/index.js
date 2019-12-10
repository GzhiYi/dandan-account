// 云函数入口文件
const request = require('request')
const cloud = require('wx-server-sdk')
const wxInfo = require('./wxInfo')

const intervelTime = 1000 // 1s的时间执行检查文件是否导出完成
cloud.init()

// 获取access token
async function getAccessToken(appid, secret) {
  return new Promise((resolve, reject) => {
    request.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`,
      (err, res, body) => {
        if (err) {
          reject(err)
          return
        }
        resolve(JSON.parse(body))
      },
    )
  })
}

// 导出数据库到腾讯自带云存储
async function exportFile(accessToken, collection, env) {
  const date = new Date().toISOString()
  return new Promise((resolve, reject) => {
    request.post(
      `https://api.weixin.qq.com/tcb/databasemigrateexport?access_token=${accessToken}`,
      {
        body: JSON.stringify({
          env,
          file_path: `${date}.json`,
          file_type: '1',
          query: `db.collection("${collection}").get()`,
        }),
      },
      (err, res, body) => {
        if (err) reject(err)
        resolve(JSON.parse(body))
      },
    )
  })
}

async function waitJobFinished(accessToken, jobId, env) {
  return new Promise((resolve, reject) => {
    // 每隔一段时间后查询导出状态
    const timer = setInterval(() => {
      request.post(
        `https://api.weixin.qq.com/tcb/databasemigratequeryinfo?access_token=${accessToken}`,
        {
          body: JSON.stringify({
            env,
            job_id: jobId,
          }),
        },
        (err, res, body) => {
          if (err) reject(err)
          const { status, file_url } = JSON.parse(body)
          if (status === 'success') {
            clearInterval(timer)
            resolve(file_url)
          }
        },
      )
    }, intervelTime)
  })
}

// 云函数入口函数
exports.main = async () => {
  const wxContext = cloud.getWXContext()
  let env = wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV
  // 会有env没有的情况，是真的有！
  if (!env) env = wxInfo.presetEnv
  cloud.updateConfig({ env })
  // 初始化数据库
  const db = cloud.database({ env })
  try {
    const {
      errmsg,
      access_token,
      errcode,
    } = await getAccessToken(wxInfo.appid, wxInfo.secret)
    // 判断access_token 返回情况
    if (errmsg && errcode !== 0) {
      throw new Error('获取access_token失败或为空。')
    }
    // 做数据库导出操作
    const {
      errmsg: jobErrMsg,
      errcode: jobErrCode,
      job_id,
    } = await exportFile(access_token, 'DANDAN_NOTE', env)
    if (jobErrCode !== 0) {
      throw new Error(`创建数据库备份任务失败：${jobErrMsg}`)
    }
    // 将任务数据存入数据库
    const addJobRes = await db.collection('BACKUP').add({
      data: {
        date: new Date(),
        jobId: job_id,
      },
    })

    const fileUrl = await waitJobFinished(access_token, job_id, env)

    // 将文件链接保存到数据库
    await db.collection('BACKUP').doc(addJobRes._id).update({
      data: {
        fileUrl,
      },
    })
  } catch (error) {
    throw new Error(`导出数据库异常：${error.message}`);
  }
}
