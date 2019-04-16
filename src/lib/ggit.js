const express = require('express');
const indexRouter = require('./app/root');
const {
    setIndexRouter,
    setTemplateEngine,
    setStaticFlodPath,
    setHandlePost
} = require('./config/config');

const ggit = express();

setHandlePost(ggit);
setStaticFlodPath(ggit);
setTemplateEngine(ggit);
setIndexRouter(ggit, indexRouter);

module.exports = ggit;