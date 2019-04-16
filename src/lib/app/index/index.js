const index = Symbol('index');
const os =require('os');
const fs = require('fs');
const { get } = require('http');
const { access, constants } = require('fs');
const { resolve } = require('path');
const { exec } = require('child_process');
const { platformOS } = require('../../utils/comfortableBrowser');
const val = require('../../utils/language');

const { 
    repository, 
    title, 
    name, 
    version, 
    description,
    update,
    license,
    homepage
} = require('../../../../package.json');
// 检查是否有git
const testIfHaveGit = () => {
    return new Promise((resolve, reject)=>{
        exec('git --version', (err, stdout)=>{
            if(err){ 
                reject({code: 0});
            }else{
                resolve({code: 1});
            }
        })
    })
}
// 找到deskop路径
const findDesktop = (homedir, cb) => {
    const path = resolve(homedir, 'desktop');
    access(path, constants.F_OK, (err) => {
        if(!err){
            cb(path);
        }else{
            cb(val('Unable to resolve desktop paths','无法解析桌面路径'));
        }
    })    
}

// computer 的基本环境
const basicEnv = (cb) => {
    const homedir =  os.homedir();
    const tmpdir = os.tmpdir();
    let env;
    findDesktop(homedir,(desktop)=>{
        env = {
            homedir: homedir,
            tempdir: tmpdir,
            desktop: desktop
        }
        const b = get('http://www.baidu.com', (res)=>{
            res.on('data', (data)=>{}).on('end', ()=>{
                cb(Object.assign(env, { onLine: 'true'}));
            })
        });
        b.on('error', ()=>{
            cb(Object.assign(env, { onLine: 'false'}));
        })
    })
}

// en
const english = {
    createRepo: 'Create Repo'    ,
    manageBranch: 'Diff Code',
    pushRemote: 'Push Remote',
    globalSetting: 'Global Setting',
    cloneRepo: 'Clone Repo',
    ggitCourse: 'GGit Course',
    language: 'en'
}
//cn
const chinsese = {
    createRepo: '新建仓库'    ,
    manageBranch: '版本比对',
    pushRemote: '推送远程',
    globalSetting: '全局设置',
    cloneRepo: '克隆仓库',
    ggitCourse: 'GGit 教程',
    language: 'zh'
}
// 默认设置
const defualtOptions = {
    repoAddress: repository.url,
    jqueryPath: 'javascripts/libs/jquery.min.js',
    webSiteTitle: title
}

// render indexPager
const indexPageRenderOptions = Object.assign({
    mainAppCssPath: 'css/index.css',
    utilsAppCssPath: 'css/utils.css',
    mainAppPath: 'javascrtips/index.js',
}, defualtOptions);

// render no-git.pug
const noGitOptions = Object.assign({
    cssPath: 'css/uninstallgit.css',
    noGitScripts: 'javascripts/uninstallgit.js'
},defualtOptions)

/**
 * @classdesc 首页渲染
 */
class Index{
    //判断是否有git 返回界面
    indexPage(req, res) {
        const { lang } = req.query;
        testIfHaveGit().then(( data ) => {
            if( 1 === data.code ){
                if('en' === lang){
                    indexPageRenderOptions.language = english;
                }else if('zh' === lang){
                    indexPageRenderOptions.language = chinsese;
                }
               res.render('index.pug', indexPageRenderOptions);
           }
        }).catch((err) => {
           if( 0 === err.code ){
               res.render('uninstallgit.pug', noGitOptions);
           }
       })
    }
    // 软件信息 package.json 配置
    aboutPage(req, res){
        const aboutApp = {
                'name:软件名': name,
                'version:版本': version, 
                'update:更新日期': update,
                'License:开源协议': license,
                'node version: node 版本': process.version,
                'system:操作系统': platformOS,
                'description:软件描述': description,
                'author:作者主页': homepage,
            }    
        res.json(aboutApp);
        res.end();
    }
    // 计算机的基本状态
    status(req, res){
        basicEnv(function(a){
            res.end(JSON.stringify(a));
        })
    }
    // 设置网页语言
    setLanguage(req, res){
        const { lang } = req.body;
        fs.writeFile(resolve(__dirname, '../../config/language.txt'), lang, (err)=>{
            if(err){
                console.error(err);
            }
        });
    }
    // 返回语言
    getLanguage(req, res){
        fs.readFile(resolve(__dirname, '../../config/language.txt'), (err, data)=>{
            if(err){ 
                console.error(err.toString()); 
                res.send({ code: 0 });
            }else{
                res.send({ code: 1, srv_msg: data.toString() });
            }
        });
    }
}

// export unique indexpage 
if(!global[index]){
    global[index] = new Index();
}
module.exports = global[index];