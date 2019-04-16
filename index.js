#!/usr/bin/env node
/**
@author sewerganger <wanghan9423@outlook.com>
@copyright random
@version 0.01
@license MIT
@description  build a git gui tool on broswer and  rebuild on 2019/1.16
 */
'use strict'


const command = require('./src/lib/utils/command');
const usefulCommand = process.argv.slice(2);

command(usefulCommand);