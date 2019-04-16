const { red, green } = require('chalk');
const { EOL } = require('os');

/**
 * @param {String} rightData one argument
 */
exports.printOut = (rightData) => {
    process.stdout.write(green(rightData));
}
/**
 * @param {String} wrongData 只有一个参数
 */
exports.printErr = (wrongData) => {
    process.stderr.write(red(wrongData));
}

/**
 * @param { String } spaceData 填写的字符串 
 * @param { Number } top 距离上行字符串 行数
 * @param { Number } bottom  距离下行字符串 行数
 * @param { Number } tab  
 */
exports.printSpace = (spaceData, top, bottom, tab) => {
    var tabNumbersString = Array(tab).fill('\t').join('');
    Array(top).fill('').forEach(v => process.stdout.write(EOL));
    process.stdout.write(tabNumbersString + green(spaceData));
    Array(bottom).fill('').forEach(v => process.stdout.write(EOL));
}
