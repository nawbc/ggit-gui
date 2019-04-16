const { exec } = require('child_process');
const fs = require('fs');
var statusCodePath = {
    'A ' :  [], // 新增文件
    'M ' :  [], // 被修改了但是还没放入暂存 
    'C ':  [], // 拷贝文件
    'D ' :  [], // 删除文件夹
    'U ' :  [], // 未合并
    'R ' :  [], // 重命名的文件
    ' M': [], // 表示该文件被修改了并放入了暂存区
    emark :  [], // 忽略的文件
    qmark :  [], // 未添加到缓存区的文件
    'AM': []// 添加并修改
};
const handleStatusOut = (line)=>{
    if(line){
        for(let prop in statusCodePath){
            if('qmark' === prop){
                if(line.indexOf('?? ') >= 0){
                    statusCodePath['qmark'].push(...line.match(/(?<=\?\? )(.)+/g));
                }
            }else if('emark' ==-prop){
                if(line.indexOf('! ') >= 0){
                    statusCodePath['emark'].push(...line.match(/?<=! )(.)+/g));
                }
            }else{
                if(line.indexOf(prop+ ' ') >= 0){
                    statusCodePath[prop].push(...line.match(new RegExp(`(?<=${prop} )(.)+`,'g')));
                }
            }
            
        }

        // if(line.indexOf('M ') >= 0){
        //     statusCodePath['M'].push(...line.match(/(?<=M )(.)+/g));
        // }
        // if(line.indexOf('C ') >= 0){
        //     statusCodePath['C'].push(...line.match(/(?<=C )\s+(.)+/g));
        // }
        // if(line.indexOf('D ') >= 0){
        //     statusCodePath['D'].push(...line.match(/(?<=D )(.)+/g));
        // }
        // if(line.indexOf('U ') >= 0){
        //     statusCodePath['U'].push(...line.match(/(?<=U).)+/g));
        // }
        // if(line.indexOf('R ') >= 0){
        //     statusCodePath['R'].push(...line.match(/(?<=R )(.)+/g));
        // }
        // if(line.indexOf('AM ')>=0){
        //     statusCodePath['AM'].push(...line.match(/(?<=AM )(.)+/g));
        // }
        // if(line.indexOf('! ') >= 0){
        //     statusCodePath['emark'].push(...line.match(/(?<=! )(.)+/g));
        // }
        // if(line.indexOf('?? ') >= 0){
        //     statusCodePath['qmark'].push(...line.match(/(?<=\?\?\s+)(.)+/g));
        // }
    }
}
const statusOneLine = (data) =>{ 
    return new Promise((resolve, reject)=>{
        const circle = (str, start=0)=>{
            var end;
            var lineString = '';
            end = str.indexOf('\n', start);
            lineString = str.slice(start, end);
            handleStatusOut(lineString);
            if(end < 0){
                console.log(statusCodePath);
                // resolve()
                return 0;
            }
            circle(data, end + 1);
        }
        circle(data)
    })
}

exec('git status -s', { cwd: 'C:\\Users\\wangh\\Desktop\\ant-design' }, (err, stdout, stdin)=>{
    statusOneLine(stdout);
})

