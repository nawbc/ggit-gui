const express = require('express');
const  { initGit, configUser, configKey, resetSSH }  = require('./ggitConfig');
const router = express.Router();

router.use('/initgit', initGit);
router.use('/adduser', configUser);
router.use('/keygen', configKey);
router.use('/resetssh', resetSSH);

module.exports = router;
