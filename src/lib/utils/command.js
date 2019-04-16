'use strict'
const packageJson = require('../../../package.json');
const { format } = require('util');
const { printErr, printSpace, printOut} = require('./MrPrint');
const generateGGit = require('../bin/start');
const readline = require('readline');


const HELP_LIST =`
\tstart\t\t--开启ggit服务/start ggit server\n\n\t\t\t-i <ip地址/ip address>\t-p <端口/port>\n
\tquick\t\t--quick < 远程仓库地址/remote path>\n
\t--version\t--查看版本信息/information about the version\n
\t--ggit\t\t--查看logo/check logo\n`

const VERSION_LIST = {
    version : 'Version/版本:' + packageJson.version,
    author :'Author/作者:' + 'wanghan',
    emial: 'Email/邮箱:942341345@qq.com',
    update: 'Date/更新日期:' + packageJson.update,
    license: 'License/开源协议:' + packageJson.license,
    description: 'Description/描述:' + packageJson.description,
    homepage: 'HomePage/个人主页:' + packageJson.homepage
}

const ggitLogo = `
    $$$$$$$$  $$$$$$$$  ##   $$
    $$        $$        ##   $$
    $$        $$            $$$$$
    $$        $$        ##   $$
    $$  $$$$  $$ $$$$$  ##   $$
    $$    $$  $$    $$  ##   $$
    $$$$$$$$  $$$$$$$$  ##   $$$$
`

const createRl = () => readline.createInterface({
    output: process.stdout,
    input: process.stdin,
    prompt: '>>'
})



const showOnTerminal = ( content, type) => {
    switch(type){
        case 'format':  
            for( let prop in content ){
                printSpace(format("%s:%s\n", prop, content[prop]));
            };
            break;
        case 'space':
            for( let prop in content ){
                printSpace(content[prop], 1, 1, 1);
            };
            break;
        case 'error':
            for( let prop in content ){
                printErr(content[prop], 1, 1, 1);
            };
            break;
        default:
            for( let prop in content ){
                printOut(content[prop], 1, 1, 1);
            };
            break;
    }
}

module.exports = (usefulArgv) => {
    usefulArgv.forEach((args) => {
        if( '--version' === args ){
            showOnTerminal( VERSION_LIST, 'space');
        }else if(args.includes('version')){
            const missStrInform = '请使用--version查看版本信息'
            showOnTerminal(missStrInform, 'error');
        }
        if( '--help' === args ){
            printOut(HELP_LIST);
        }else if(args.includes('help')){
            const missStrInform = '请使用--help查看版本信息'
            showOnTerminal(missStrInform, 'error');
        }

        if('--ggit' === args){
            showOnTerminal(ggitLogo);
        }else if(args.includes('ggit')){
            const missStrInform = '请使用--ggit查看版本信息'
            showOnTerminal(missStrInform, 'error');
        }
        if( 'start' === args ){
            const indexP = usefulArgv.findIndex(val => '-p' === val);
            const indexI = usefulArgv.findIndex(val => '-i' === val );
            const port = indexP > 0? usefulArgv[indexP + 1]: undefined;
            const ip = indexI > 0 ? usefulArgv[indexI + 1]: undefined;
            generateGGit(port, ip);
        }
        if( 'quick' === args ){
            const rl = createRl()
            rl.question('请输入地址:', (answer)=>{
                printOut('useLess');
                rl.close();
            })
        }
    })
}


