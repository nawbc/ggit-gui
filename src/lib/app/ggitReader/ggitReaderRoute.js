const express = require('express');
const  { renderGGitReaderIndex, nativeItems, readFileContent }  = require('./ggitReader');
const router = express.Router();

router.use('/index', renderGGitReaderIndex);
router.use('/nativeitem', nativeItems);
router.use('/renderfile', readFileContent);

module.exports = router;
