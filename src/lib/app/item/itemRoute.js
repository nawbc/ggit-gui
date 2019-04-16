const express = require('express');

const {
    initItem,
    backCurrentFiles,
    checkCommitLog,
    addToStage,
    cacheArea,
    gitConfigFile,
    commitRepo,
    gitManageBranch
} = require('./ggitItem');

const router = express.Router();

router.use('/init', initItem);
router.use('/files', backCurrentFiles);
router.use('/log', checkCommitLog);
router.use('/addtostage', addToStage);
router.use('/cache', cacheArea);
router.use('/configfile', gitConfigFile);
router.use('/commitrepo', commitRepo);
router.use('/branch/:id', gitManageBranch);

module.exports = router;