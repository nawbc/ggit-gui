const fs = require('fs');
const os = require('os');
const { resolve } = require('path');
const val = require('../../utils/language');
const { exec } = require('child_process');
const ggitConfig = Symbol('ggitConfig');
const pathLib = require('path');
const { mrSpawn } = require('../../utils/MrShell');


/**
* @return { Promise } 
* 
*/

const sshdir = resolve(os.homedir(), '.ssh');

const showPublicKey = () => {    
	const plat = os.platform()
    return new Promise((resolve, reject)=>{
		
        fs.access(sshdir + pathLib.sep + 'id_rsa.pub', fs.constants.F_OK, (err_a)=>{
            if(err_a){
				exec('git config user.email', (err, stdout, stdin)=>{
					if(err){
						console.error(err.toString());
						reject({ code: 0, err_msg: val('Please select user settings first','请先选择用户设置')});
					}else{
						if('win32' === plat){
							exec('start cmd');
						}else if('linux' === plat){
							exec('gnome-terminal');
						}
						resolve({ code: 1 , srv_msg: `${val('Please use it at the terminal','请使用在终端使用')}:\nssh-keygen -b 4096 -t rsa -C ${stdout.trim()}`});
					}
				})
			}else{
				fs.readFile(sshdir + pathLib.sep + 'id_rsa.pub', { encoding: 'utf-8' },(err_c, val_c)=>{
					if(err_c){
						console.error(err_c.toString());
						reject({ code: 0, err_msg: err_c.toString() });
					}else{
						resolve({ code: 1, srv_msg: val_c });
					}
				})
			}
		}) 
	})
}

class GGitConfig{

	// 设置git用户
	configUser(req, res){
		const { username, email } = req.body;
		const configEmail = `git config --global user.email ${email}`;
		const configUser = `git config --global user.name ${username}`;

		exec(configUser, (err)=>{
			if(err){
				console.error(err);
			}else{
				exec(configEmail, (err_a)=>{
					if(err_a){
						console.error(err_a);
						res.send({ code: 0, err_msg: err_a.toString()})
					}else{
						res.send({ code: 1, srv_msg: 'git初始配置成功' });
					}
				})
			}
		})
	}

	// 初始化git设置
	initGit(req, res){
		mrSpawn('git', ['config', '--list']).then((data)=>{
			const username = data.msg.indexOf('user.name', 0) >= 0 ? 1 : 0;
			const email = data.msg.indexOf('user.email', 0) >= 0 ? 1 : 0;
			if(email && username){
				res.json({ code: 1, srv_msg: val('Signature set','签名已设置'), data_msg: data.msg });
			}else{
				res.json({ code: 0, srv_msg: val('Signature not set, please select global settings','签名未设置, 请选择全局设置') });
			}
		}).catch((err)=>{console.error(err)})
	} 
	//设置公钥
	configKey(req, res){
		showPublicKey().then((data)=>{
			res.send(data)
		}).catch((err)=>{
			res.send(err);
		})
	}
	// 重置ssh 
	resetSSH(req, res){
		const { reset } = req.query;
		if("true" === reset){
			fs.unlink(sshdir + pathLib.sep + 'id_rsa.pub', (err)=>{
				if(err) {
					console.error(err.toString());
					res.send({ code: 0, err_msg: val('Reset Failure', '重置失败') });
				}else{
					fs.unlink(sshdir+ pathLib.sep + 'id_rsa', (err)=>{
						if(err) {
							console.error(err.toString());
							res.send({ code: 0, err_msg: val('Reset Failure', '重置失败') });
						}else{
							res.send({ code: 1, srv_msg: val('Reset Successfully', '重置成功') });
						}
					})
				}
			})
		}
	}
}

if(!global[ggitConfig]){
	global[ggitConfig] = new GGitConfig();
}

module.exports = global[ggitConfig];
