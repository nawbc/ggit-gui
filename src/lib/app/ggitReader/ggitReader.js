const ggitReader = Symbol('ggitReader');
const fs = require('fs');
const md = require('markdown-it')();
const path = require('path');
const val = require('../../utils/language');

// const 

class GGitReader{
    renderGGitReaderIndex(req, res){
        res.render('ggitreader.pug');
    }
    nativeItems(req, res){
        const nativeItemsPath = path.resolve(__dirname, './nativeItems');
        fs.readdir(nativeItemsPath, (err, files)=>{
            if(err || files.length <= 0 ) {
                res.send({
                    code: 0,
                    srv_msg: {
                        nativePath: nativeItemsPath, 
                        files :  [val('No Native Item', '没有本地项目')]
                    }
                });
            }else{  
                res.send({
                    code: 1,
                    srv_msg: {
                        nativePath: nativeItemsPath, 
                        files : files
                    }
                })
            }
        })
    }
    readFileContent(req, res){
        const { path } = req.body;
        fs.readFile(path, (err, data)=>{
            if(err){
                console.error(err.toString());
                res.send({ code: 0, err_msg: val('Read File Error', '文件读取出错') });
            }else{
                res.send({ code: 1 , srv_msg: md.render(data.toString()) });
            }
        })
    }
}

if(!global[ggitReader]){
	global[ggitReader] = new GGitReader();
}

module.exports = global[ggitReader];
