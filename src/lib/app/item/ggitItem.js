const fs = require('fs');
const item = Symbol('item');
const pathLib = require('path');
const val = require('../../utils/language');
const { exec } = require('child_process');
const readline = require('../../utils/readline');
const { isString } = require('../../utils/checker');
const { mrSpawn } = require('../../utils/MrShell');

/**
 * @description 给缓存区文件分类
 * @return { Promise }
 */

// 处理git status -s输出
const handleStatusSStd = (basePath, data)=>{
    var statusCodePath = {
        'A ' :  [], // 新增文件
        'M ' :  [], // 被修改了但是还没放入暂存 
        ' M': [], // 表示该文件被修改了并放入了暂存区
        'C ':  [], // 拷贝文件
        'D ' :  [], // 删除文件夹
        'U ' :  [], // 未合并
        'R ' :  [], // 重命名的文件
        'AM': [],// 添加并修改
        emark :  [], // 忽略的文件
        qmark :  [], // 未添加到缓存区的文件
    };
    const analyzeStdout = (line) => {
        if(line){
            for(let prop in statusCodePath){
                if('qmark' === prop){
                    if(line.indexOf('?? ') >= 0){
                        let qmarkPath = pathLib.join(basePath, ...line.match(/(?<=\?\? )(.)+/g));
                        statusCodePath['qmark'].push(qmarkPath);
                    }
                }else if('emark' === prop){
                    if(line.indexOf('! ') >= 0){
                        let emarkPath = pathLib.join(basePath, ...line.match(/?<=! )(.)+/g));
                        statusCodePath['emark'].push(emarkPath);
                    }
                }else{
                    if(line.indexOf(prop + ' ') >= 0){
                        let normalPath = pathLib.join(basePath, ...line.match(new RegExp(`(?<=${prop} )(.)+`, 'g')));
                        statusCodePath[prop].push(normalPath);
                    }
                }   
            }
        }
    }
    return readline(data, statusCodePath, '\n', analyzeStdout);
}

// git branch stdout
const handleBranchStd = (data) => {
    var a = {}, b = [];
    const analyzeStdout = (line)=>{
        if(line.includes('*')){
            a.currentBranch = line.replace(/\*\s+/g,'');
        }else{
            b.push(line.trim());
            a.otherBranch = b;
        }
    }
    return readline(data, a, '\n', analyzeStdout);
}

// 处理git log输出
const handleLogStd = (data)=>{
    var v= [];
    const handleText = (line, cb)=>{
        var a = line.match(/(?<=commit )(.)+/g);
        var b = line.match(/(?<=Author: )(.)+/g);
        var c = line.match(/(?<=Date: )(.)+/g);
        var d = line.match(/(?<=\n\s+)(.)+/g);
        v.push([...a, ...b, ...c, ...d]);
    }
    return new Promise((resolve, reject)=>{
        const handler = (data, start = 1)=>{
            var end;
            var lineString = '';
            end = data.indexOf('\ncommit', start);
            if(end === -1){
                lineString = data.slice(start-1, data.length);
            }else{
                lineString = data.slice(start-1, end);
            }
            handleText(lineString);
            if(end < 0){
                resolve(v);
                return 0;
            }
            handler(data, end + 1);
        }
        handler(data.trim());
    })
}

//读取当前文件目录
const readCurrentDirs = (path) => new Promise((resolve, reject)=>{
    var arr = [];
    var count = 0;
    fs.readdir(path, (err, files)=>{
        if(Array.isArray(files)){
            files.forEach( f =>{
                var temp = pathLib.resolve(path, f);
                fs.stat(temp, (err, stats)=>{
                    if(err) reject(err);
                    var n = stats.mtime.toLocaleString();
                    if(stats.isDirectory()) {
                        arr.push([f, 'dir', n]);
                    }else if(stats.isFile()){
                        arr.push([f, 'file', n]);
                    }else if(stats.isSymbolicLink()){
                        arr.push([f, 'link', n]);
                    }else{
                        arr.push([f, 'unknown', n]);
                    }
                    ++ count;
                    if(count === files.length){
                        resolve(arr);
                    }
                })
            })
        }
    })
})

// 处理提交标准输出流
const  handleCommitStd = (data)=> new Promise((resolve, reject)=>{
    if(data.indexOf('working tree clean')){
        resolve(val('nothing to commit, working tree clean', '没有添加, 工作区干净'));
    }else if(true){
        var d = data.match(/(\d)+(.)+files|(\d)+(.)+insertions|(\d)+(.)+deletions/g);
        resolve(d);
    }
})

// C:\Users\wangh\Desktop\demoJava
class Items{
    initItem(req, res){
        const { path } = req.body;
        const resolvePath = pathLib.resolve(path);

        fs.access(resolvePath, fs.constants.F_OK, (err)=>{
            if(err){
                res.send({ code: 0, err_msg: val('This path does not exist','不存在该路径')});
            }else{
                mrSpawn('git', ['init'], { cwd: path}).then((data)=>{
                    const isReInitNum = data.msg.indexOf('Reinitialized');                        
                    readCurrentDirs(resolvePath).then((data)=>{
                        const base = { code: 1, files: data };
                        if(isReInitNum >= 0){
                            res.send(Object.assign(base, { srv_msg: path + val(' Reinitialized',' 已重新初始化')}));
                        }else{
                            res.send(Object.assign(base, { srv_msg: path + val('Successful initialization','初始化成功')}));
                        }
                    }).catch((err)=>{
                        console.error(err);
                        res.send({ code: 0, err_msg: val('Project Reading Failed, Reoperation','项目读取失败, 重新操作')});
                    })
                }).catch((err)=>{
                    console.error(err.err_msg);
                    res.send({ code: 0, err_msg: val('initialization failed','初始化失败') });
                })
            }

        })
    }    
    // 返回当前目录
    backCurrentFiles(req, res){
        const { path } = req.body;
        readCurrentDirs(path).then((data)=>{
            res.send({ code: 1, files: data });
        }).catch((err)=>{
            res.send({ code: 0, err_msg: val('read failure','读取失败')});
        })
    }
    
    // 返回当前项目提交日志
    checkCommitLog(req, res){
        const { path } = req.body;
        fs.access(path+ '/.git', fs.constants.F_OK, (err)=>{
            if(err){
                mrSpawn('git', ['init'], { cwd: path });
                console.log(err);
            }else{
                mrSpawn('git', ['log'], { cwd: path }).then((stdout)=>{
                    handleLogStd(stdout.msg).then((data)=>{
                        var jsonLog = JSON.stringify({ log: data })
                        res.send({ code: 1, srv_msg: jsonLog});
                    })
                }).catch((err)=>{ 
                    res.send({ code: 0, err_msg: val('No submission','暂无提交') });
                });
            }
        })
    }

    // 添加工作区文件到缓存区
    addToStage(req, res){
        const { willStage, path } = req.body;
        const files = 'all' === willStage ? '.': willStage.replace(/,/g, ' ');
        exec('git add ' + files,{ cwd: path },(err, stdout, stdin)=>{
            if(err) {
                res.send({ code: 1, err_msg:  err.toString() });
            }else{
                res.send({ code: 1, srv_msg: val('Add Success', '添加成功') });
            }
        })
    }

    // 提交到仓库
    commitRepo(req, res){
        const { cwd, value } = req.body; 
        mrSpawn('git', ['commit', '-m', value], { cwd: cwd}).then((data)=>{
            if(1 === data.code){
                handleCommitStd(data.msg).then((data)=>{
                    res.send({ code: 1, srv_msg: data });
                })
            }else{
                res.send({ code: 0, err_msg: val('Commit Failure','提交失败')});
            }
        })  
    }

    // 查看缓存区
    cacheArea(req, res){
        const { path } = req.body;

        exec('git status -s', { cwd: path }, (err, stdout)=>{
            if(err){
                console.error(err);
                res.send({ code: 0, err_msg: val('Stage Reading Failed','缓存区读取失败') });
            }else{
                handleStatusSStd(path, stdout).then((data)=>{
                    res.send({ code: 1, srv_msg: data});
                })
            }
        })
    }

    // 添加.gitignore, .gitattribuate
    gitConfigFile(req, res){
        const { path, type, data } = req.body;
        if(isString(path) && isString(path)&& isString(data)){ 
            res.send({ code: 0, err_msg: val('Not format', '请使用正确格式')});
            return false; 
        }
        fs.writeFile(path+pathLib.sep+type, data, (err)=>{
            if(err){
                res.send({ code: 0 , srv_msg: type + val('Write failure','写入失败')});
            }else {
                res.send({ code: 1 , srv_msg: type + val('Write successfully', '写入成功') })
            };
        })
    }

    // 管理分支
    gitManageBranch(req, res){
        const way = req.params['id']
        if('get' === way){
            const { path } = req.body;
            if('string' !== typeof path){ res.send({ code: 0, err_msg: val('Not format', '请使用正确格式')});return false; }
            exec('git branch', { cwd: path }, (err, stdout, stdin)=>{
                if(err) { 
                    console.error(err.toString()); 
                    res.send({ code: 0, err_msg: err.toString() });
                }else{
                    var std = stdout.toString();
                    handleBranchStd(std).then((data)=>{
                        res.send({ code: 1, srv_msg: data });
                    })
                }
            })
        }else if('switch' === way){
            const { branch , currentItem } = req.query;
            exec(`git checkout ${branch}`, { cwd: currentItem }, (err, stdout, stdin)=>{  
                if(err){
                    console.error(err);
                    res.send({ code: 0, err_msg: err.toString() });
                }else{
                    res.send({ code: 1, srv_msg:  val(`switch to ${branch}`, `切换至${branch}`)});
                }
            })
        }else if('create' === way){
            const { branchName, cwd } = req.body;
            exec(`git branch ${branchName}`, { cwd: cwd }, (err, stdout)=>{   
                if(err){
                    console.error(err);
                    res.send({ code: 0, err_msg: val('create failure', `${branchName} 创建失败`)});
                }else{
                    res.send({ code: 1, srv_msg: val('create successfully', `${branchName} 创建成功`)});
                };
            }) 
        }
    }
}

if(!global[item]){
    global[item] = new Items();
}

module.exports = global[item];