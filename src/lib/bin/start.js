const http = require('http');
const ggit = require('../ggit');
const { comfortableBrowser } = require('../utils/comfortableBrowser');
const { printErr, printOut } = require('../utils/MrPrint');
const { resolve } =require('path');
const { isIPv4 } = require('net');
const { readFile } = require('fs');
const val = require('../utils/language');


const sparePort = 1033;
const EADDRINUSE = 'EADDRINUSE';
const ACCESS = 'ACCESS';

module.exports = (port=1031, ip='localhost') => {
    const srv = http.createServer(ggit);
    // 处理被占用的端口 1033
    const handleSrvInUsed = () => {
        printOut('1031端口已被占用, 3s后切换到' + sparePort);
        srv.listen(port, sparePort, () => {
            printErr('端口已切换到 1033');
        })
    }
    // 没有权限
    const handleNoAccess = () => {
        printErr('访问权限被禁止win32请使用管理员权限linux请使用su/chmod');
    }
    // 3s秒后跳转浏览器
    const turnToBrowser = (time, ip, port, path) => {
        const ipIsNotv4 = 'ip 地址不是v4协议';
        setTimeout(() => {
            if( !isIPv4(ip) ){ printOut(ipIsNotv4); }
            else{ comfortableBrowser(ip, port, path); }
        }, time);
    }
    srv.on('error', (err) => {
        switch( err.code ){
            case EADDRINUSE: handleSrvInUsed();break;
            case ACCESS:  handleNoAccess();break;
        }
    })  
    //默认1031端口
    srv.listen(port, ip, () => {
        const address = srv.address();
        const addr =  address.address;
        const myPort = address.port;
        const delayTime = 3000;
        readFile(resolve(__dirname, '../config/language.txt'), (err, data)=>{
            var path;
            if(err){
                path = '/index?lang=zh'
            }else{
                path = 'en' === data.toString() ? '/index?lang=en': '/index?lang=zh';
            }
            printOut(`ggit ${val('running on', '运行在')} ${addr}:${myPort} ${delayTime/1000}${val('\'s later skip webpage automatically  ','秒后自动跳转')}......\n`);
            // turnToBrowser(delayTime, addr, myPort, path);
        });
    })
}