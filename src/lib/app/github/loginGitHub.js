/**
 * @author wanghan
 * @lastModified 2019/1/17
 * @description 模拟登录GitHub抓取信息
 */

const { printErr } = require('../../utils/MrPrint');
const request_origin = require('request');
const cheerio = require('cheerio');

const baseUrl = 'https://github.com';

const pipe = (...argv) => x => {
	argv.reduce((nextFunction, currentFunction)=> currentFunction(nextFunction), x);
}
const request = request_origin.defaults({jar: true});   //安全 打开带上 cookie

//抓取token
const getToken = () => {
	return new Promise((resolve, reject)=>{
		request.get(baseUrl + '/session', (err, response, body) => {
			if(err){ reject({code: 0, err_msg: err}) };
			if(body){
				const $ = cheerio.load(body);
				const authorationToken = $('form[action="/session"]').children('input[name=authenticity_token]').val();
				resolve(authorationToken);
			}else{
				reject({code: 0, err_msg: 'no network'});
			}
		})
	})
}
// 模拟登陆
const analogLogin = (token, username, pwd)=>{
	const options = {
		url: baseUrl + '/session',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		form: {
			'login': username,
			'password': pwd,
			'authenticity_token': token,
			'utf8': encodeURIComponent('✓'),
			'commit': encodeURIComponent('Sign+in')
		},
	}
	return new Promise((resolve, reject)=>{
		request(options, (err_a, response_a)=>{
			if(err_a) { reject({code: 0, err_msg: err_a.toString()}) }
			const cookie_session = response_a.headers['set-cookie'];
			request.get({
				url: baseUrl + '/session',
				headers: {
					Cookie:  cookie_session,
				}
			}, (err_b, response_b, body)=>{
				if(err_b) { reject({code: 0, err_msg: err_b.toString()}) }
				resolve({ code: 1, loggedhtml: body});
			})
		})
	})
}

//抓取仓库信息
const pickRepository = (html) => {
	const $ = cheerio.load(html);
	var href;
	var foldName;
	var $aLink = $('.public.source .d-inline-flex');
	var username = $('.no-underline > .css-truncate-target').text();
	let githubFold = {};
	return new Promise((resolve,reject)=>{
		$aLink.each((index, ele_a)=>{
			href = ele_a.attribs.href
			foldName = href.split('/')[href.split('/').length - 1];
			githubFold[foldName] = baseUrl + href;
			if(index === $aLink.length - 1){
				resolve({
					gitRepos: githubFold,
					username: username.replace(/\n|\s+/g, ''),
				})
			}
		})
	})
}

/**
 * 
 * @param { String } username 
 * @param { String } password 
 * @return 登陆界面信息
 */

class GitHub{
	constructor(){
		this._html = '';
		this.login = this.login.bind(this);
		this.pickGitHubRepo = this.pickGitHubRepo.bind(this);
		this.getToken = getToken;
	}
	async login (username, pwd){
		if(!username && !pwd ){
			printErr('need username and password');
			return false;
		}
		const authorationToken = await this.getToken().then(data=>data).catch((err)=>{
			printErr(err.err_msg); 	// get authorization_name from github
		});
		const afterLoginHtml = await analogLogin(authorationToken, username, pwd).then(data=>data.loggedhtml).catch((err)=>{
			printErr(err.err_msg); // analogLogin
		});
		this._html = afterLoginHtml;
		return this;
	}
	// 抓取仓库
	async pickGitHubRepo (){
		const repositories =await pickRepository(this._html).then(data=>data);
		return repositories;
	}
}

module.exports = new Proxy(new Github(), {
	get(){

	}
})