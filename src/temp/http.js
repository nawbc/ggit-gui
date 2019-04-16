var  msg;
            if('string' === typeof str){
                var a = [...str.match(/((?<=\.gitignore files:\n+)((.)+\n)+)(?=Use)/g)];
            }
            if(a){
                msg = `.gitignore ${val('includes', '中包含')}` + a.toString() + val('File','文件');
            }else{
                msg = val('Add failure','添加失败');
            }
            res.send({ code: 0, err_msg: msg });