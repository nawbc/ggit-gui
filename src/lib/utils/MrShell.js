const { spawn } = require('child_process');

/**
* @return stdout stderr
* @param {Array} argv
*/

exports.mrSpawn = (cmd, argv, options) => {
	var temp = "";
	const shellApp = spawn(cmd, argv, options);
	return new Promise(( resolve, reject ) => {
		shellApp.stdout.on('data', ( data ) => {
			temp += data;
		})
		shellApp.stdout.on('end', ()=>{
			resolve({ code: 1, msg: temp.toString()});
		})
		shellApp.stderr.on('data', ( data ) => {
			reject({ code: 0, err_msg: data.toString() });
		})
	})
}
