# 函数文档

<details>

<summary>记账</summary>

### 新增一笔账单（函数名：account, mode: add）

| key| 说明    | 是否必填  |
| --------   | -----   | ---- |
| money|金钱, 限制到小数位后连点, 如100.00|是|
| categoryId|分类ID|是|
| noteDate|此记录的时间,具体到日期, 可用Date格式,格式: 2019-8-21|是|
| description|记录的描述|否|
| flow|金钱的流向, 0-支出, 1-收入|是|
||||



### 修改一笔账单（函数名：account, mode: updateById）

| key| 说明    | 是否必填  |
| --------   | -----   | ---- |
| id|id|是|
| money|金钱, 限制到小数位后连点, 如100.00|否|
| categoryId|分类ID|否|
| noteDate|此记录的时间,具体到日期, 可用Date格式,格式: 2019-8-21|是|| id|id|否|
| description|记录的描述|否|
||||



### 删除一笔账单（函数名：account, mode: deleteById）

| key| 说明    | 是否必填  |
| --------   | -----   | ---- |
| id|id|是|
||||



### 获取一笔账单（函数名：account, mode: getNoteById）

| key| 说明    | 是否必填  |
| --------   | -----   | ---- |
| id|id|是|
||||

</details>

<details>
<summary>获取分类列表</summary>

### 获取分类列表（函数名：getCategory）

| key| 说明    | 是否必填  |
| --------   | -----   | ---- |
| flow|金钱的流向, 0-支出, 1-收入|是|
||||

</details>

