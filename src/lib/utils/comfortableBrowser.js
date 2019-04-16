const { platform } = require('os');
const { exec } = require('child_process');

var terminal;
var osName;
switch (platform()) {
    case 'linux':
        osName = 'Linux';
        terminal = 'xdg-open';
        break;
    case 'win32':
        osName = 'windows';
        terminal = 'start';
        break;
    case 'darwin':
        osName = 'OX/Unix';
        terminal = 'open';
        break;
    default:
        return '不支持此平台';
}

exports.comfortableBrowser = (ip, port, path) => {
    return exec(`${terminal} http://${ip}:${port}${path}`);
};

exports.platformOS = osName;