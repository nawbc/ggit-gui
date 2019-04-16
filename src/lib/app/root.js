const express = require('express');
const router = express.Router();
const cloneRoute = require('./clone/cloneRoute');
const indexRoute = require('./index/indexRoute');
const ggitConfigRoute = require('./ggitConfig/configRoute');
const itemRoute = require('./item/itemRoute');
const  ggitreader = require('./ggitReader/ggitReaderRoute');

/**
 * 路由集合
 * @todo  /  主页面路由
 * @todo  /config git设置路由
 * @todo  /clone   克隆
 * @todo /item 项目操作路由 
 * @todo /ggitreader 离线阅读器
 * @todo /github ggit UI版
 */
router.use('/',  indexRoute);
router.use('/config',  ggitConfigRoute);
router.use('/clone', cloneRoute);
router.use('/item', itemRoute);
router.use('/ggitreader', ggitreader);
router.use('/github', (req, res)=>{
    res.end('github');
})

module.exports = router;


