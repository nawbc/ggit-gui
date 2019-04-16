const clone = Symbol('clone');
const { exec } = require('child_process');
const { resolve } = require('path');

const { access, constants } = require('fs');
const val = require('../../utils/language');

class Clone{

    /**
     * @param { Object } req 
     * @param { Object } res 
     */
    clone(req, res){
        const { remoteUrl,  localUrl } = req.body;
        access(resolve(localUrl), constants.F_OK, (err) => {
            if(err) {
                res.send({ code: 0, err_msg: `${val('No','没有')}${localUrl}${val('this path','这个路径')}`})
            }else{
                exec(`git clone ${remoteUrl}`, { cwd: localUrl }, (err_a, stdout, stdin) => {
                    if(err){
                        console.error(err.toString());
                        res.send({ code: 0, err_msg: val('Clone Failure', '克隆失败')});
                    }else{
                        res.send({ code: 1, srv_msg: val('Clone Success', '克隆成功') });
                    }
                })
            }
        })
    }

}

if(!global[clone]){
    global[clone] = new Clone();
}

module.exports = global[clone];



