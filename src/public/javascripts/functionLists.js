(function (global, factory) {
    factory(global);
})(this, function (exports) {
    'use strict'
    const fsView = new FsView();

    /**
     * -------------------------------------------------------------------------
     * @description  不可描述
     * @lastmodified 2019/2/2
     * --------------------------------------------------------------------------
     */

    /**
     * @param { String } mail 检查的email 地址
     */

    const checkEmail = (mail) => {
        const reg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
        return reg.test(mail);
    }

    /**
     * @description 创建模板那 不可多层嵌套
     * @param { Array } 数组
     * @return { String } 生成的html字符串
     */
    const createTemplate = (argv) => {
        var html = '';
        argv.forEach((v1, index) => {
            html += '<' + v1[0] +
                (v1[1] ? ' class=' + '"' + v1[1] + '"' : '') +
                (v1[2] ? ' type=' + '"' + v1[2] + '"' : '') +
                ('input' === v1[0] ? (v1[3] ? ' value=' + '"' + v1[3] + '"' : '') : '') +
                '>' +
                ('input' === v1[0] ? /** input后面没有元素*/ '' :
                    /**元素内容 包含闭合标签*/
                    (v1[3] ? v1[3] : '') + '</' + v1[0] + '>')
        })
        return html;
    }

    const checkInputValue = (val)=>{
        return '' === val ? val : utils.ggitNotification(switchLang('please valid value', '请输入有效内容'), true);
    } 

    /**
     * --------------------------------------------------------------------------
     * @description 本地仓库操作  
     * @lastmodified 2019/2/1
     * -------------------------------------------------------------------------
     */

    //判断文件git的状态码
    LocalRepo.prototype.handleFilesStatus = (status)=>{
        switch(status){
            case 'A ': return switchLang('newly add', '新增');break;
            case 'M ': return switchLang('modify un stage', '修改未添加');break;
            case ' M': return switchLang('modfiy stage', '修改添加');break;
            case 'C ': return switchLang('copy', '拷贝');break;
            case 'D ': return switchLang('delete', '删除');break;
            case 'U ': return switchLang('unmerge', '未合并');break;
            case 'R': return switchLang('rename', '重命名');break;
            case 'AM': return switchLang('add modify', '添加修改');break;
            case 'emark': return switchLang('ignore', '忽略');break;
            case 'qmark': return switchLang('un add', '未添加');break;
        }
    }

    //创建文件区缓存区仓库区操作html
    LocalRepo.prototype.createOperateRepoHtml = () => {
        $('.operateWrapper').empty();
        const html = 
        `<div class="tinyFucntion">
            <ul>
                <li class="fa">${switchLang('WorkStation', '查看工作区')}</li>
                <li class="fb">${switchLang('View Stage','查看缓存区')}</li>
                <li class="fc">${switchLang('View Repo','查看仓库区')}</li>
                <li class="fd">${switchLang('Branch', '分支管理')}</li>
                <li class="fe">${switchLang('Commit','提交到仓库')}</li>
                <li class="ff">${switchLang('Check Log','查看日志')}</li>
                <li class="fg">${switchLang('Reset','版本回滚')}</li>
                <li class="fh">${switchLang('Config .git', '配置 .git')}</li>
            </ul>
        </div>
        <div class="tinyDisplay">
                <div class="tinyContainer">
                    <div class="tinyWrapper"></div>
                </div>
        </div>`
        $('.operateWrapper').append(html);
        utils.toggleTheme($('.tinyFucntion ul li'));
    }
    // 获取分支
    LocalRepo.prototype.getBranchs = (src, callback) => {
        $.post('/item/branch/get', {
            path: src
        }, (data) => {
            callback(data);
        })
    }

    //查看工作区
    LocalRepo.prototype.checkWorkStation = (src) => {
        localRepo.getBranchs(src, (data)=>{
            if (1 === data.code) {
                window.sessionStorage.setItem('branch_a', JSON.stringify(data.srv_msg));
                localRepo.createOperateRepoHtml();
                fsView.requestFiles(src, (data)=>{
                    fsView.createFileSystemHtml(src, data.files, switchLang('WorkStation', '工作区'));
                });
                // tiny功能区功能
                localRepo.tinyFunctionController();
            } else {
                utils.ggitNotification(data.err_msg, true);
            }
        })
    }
    LocalRepo.prototype.createLogHtml = (logs) => {
        $('.tinyWrapper').empty();
        var html = "";
        var noLog = switchLang('no commit message', '无提交说明');
        logs.forEach((v, index) => {
            html += `<li class="echoVersion">
                            <div class="hashVersion">
                            <span>${switchLang('Version','版本')}${logs.length - index}</span><span>${v[0]}</span></div>
                            <div class="author"><span>${switchLang('Author','作者')}:</span><span>${v[1]}</span></div>
                            <div class="date"><span>${switchLang('Date','日期')}:</span><span>${v[2]}</span></div>
                            <div class="commit_m">
                                <span>${switchLang('Commit', '提交记录')}:</span>&nbsp<span>${'' === v[3] ? noLog : v[3]}</span>
                            </div>
                        </li>`;
        })
        $('.tinyWrapper').append('<ul class="gitLog">' + html + '</ul>');
    }
    //查看日志
    LocalRepo.prototype.checkGitLog = () => {
        var path = window.sessionStorage.getItem('currentItem');
        $.post('/item/log', {
            path: path
        }, function (data) {
            if (1 === data['code']) {
                var logParser = JSON.parse(data.srv_msg)['log'];
                localRepo.createLogHtml(logParser);
            } else {
                utils.ggitNotification(data.err_msg, true);
            }
        })
    }
    // 转换成fsView createFileSystemHtml 可读的数据形式
    LocalRepo.prototype.transfsViewReadable = (state) => {

        let tempStageFiles = [];
        for(let prop in state){
            state[prop].forEach((val)=>{
                //writehere
                let kind = /\\|\//g.test(val)? 'dir': 'file';
                tempStageFiles.push([val, kind, localRepo.handleFilesStatus(prop)]);
            })
        }
        return tempStageFiles;
    }
    
    // 显示缓存区文件
    LocalRepo.prototype.displayStageHtml = (data)=>{
        $('.tinyWrapper').empty();
        const readableDate = localRepo.transfsViewReadable(data);
        const basePath = sessionStorage.currentItem;
        fsView.createFileSystemHtml(basePath,readableDate, switchLang('stage', '缓存区'));
    }

    // 查看缓存区 请求缓存区
    LocalRepo.prototype.checkStage = () => {
        $.post('/item/cache', {
            path: window.sessionStorage.getItem('currentItem')
        }, function (data) {
            if (1 === data.code) {
                console.log(data)
                // localRepo.displayStageHtml(data.srv_msg);
            } else {
                utils.ggitNotification(data.err_msg, true, 3000);
            }
        })
    }
    // 创建设置.gitignore 弹出框
    LocalRepo.prototype.createConfigGitHtml = () => {
        var html = `<textarea class="textarea_b"></textarea>
                        <div>
                            <select class='select_a'>
                                <option>.gitignore</option>
                                <option>.gitattributes</option>
                            <select>
                            <input class="config_a" type="button" value="${switchLang('Sure', '确定')}">
                        <div>
                        `
        $('.popContainer').append(html);
    }

    // 创建配置文件视图
    LocalRepo.prototype.createConfigPopup = () => {
        utils.popUpToggle($('.ggitPopup'), $('.popCancel')) // mark
        localRepo.createConfigGitHtml();
        $('.config_a').click(function () {
            const currentItem = window.sessionStorage.currentItem;
            const $str = $('.textarea_b').switchLang();
            if ("" === $str) {
                utils.ggitNotification(switchLang('无内容', 'No Content'));
            } else {
                $.post('/item/configfile', {
                    path: currentItem,
                    data: $str,
                    type: $('.select_a').switchLang()
                }, function (data) {
                    utils.ggitNotification(data.srv_msg);
                })
            }
        })
    }

    // 创建提交到仓库Html
    LocalRepo.prototype.createCommitMsgHtml = () => {
        var block = ''
        const barSelect = [`${switchLang('type', '类型')}`, `${switchLang('body','具体修改内容')}`,
            `${switchLang('feat', '特性')}`, `${switchLang('scope', '影响的范围')}`,
            `${switchLang('fix', '修复问题')}`, `${switchLang('refactor','代码重构')}`,
            `${switchLang('docs', '文档修改')}`, `${switchLang('style', '代码格式')}`,
            `${switchLang('test','测试用例修改')}`, `${switchLang('chore', '其他修改')}`,
            `${switchLang('scope', '影响的范围')}`, `${switchLang('footer', '一些备注')}`
        ];
        barSelect.forEach(val => {
            block += `<li>${val}</li>`
        })
        var html = `  <div class='helpBar'>
                            <div class="icon_l"></div>
                            <div><ul class='helpBarWrapper'>${block}</ul></div>
                            <div class="icon_r"></div>
                            </div>
                            <textarea class='textarea_c' placeholder='${switchLang('Message', '备注')}'></textarea>
                            <input type='button' value='${switchLang('Sure', '确定')}' class='commit_button' />`
        $('.popContainer').append(html);
    }
    
    // 提交内容到仓库
    LocalRepo.prototype.requestToCommit = ()=>{
        const currentItem = window.sessionStorage.currentItem;
        $('.popContainer .commit_button').click(function(){
            $.post('/item/commitrepo', { 
                cwd:  currentItem,
                value: $('.textarea_c').val()
            }, function(c_data){
                if(1 === c_data.code){
                    utils.ggitNotification(c_data.srv_msg);
                }else{
                    utils.ggitNotification(c_data.err_msg, true);
                }
            })
        })
    }

    // 提交到仓库
    LocalRepo.prototype.commitRepo = () => {
        const str = window.sessionStorage.config;
        // 控制help移动 
        const moveHelpBarController = () => {
            $('.helpBar .icon_l').click(function () {
                $('.helpBar div:eq(1)')[0].scrollBy(-200, 0);
            })
            $('.helpBar .icon_r').click(function () {
                $('.helpBar div:eq(1)')[0].scrollBy(200, 0);
            })
            $('.helpBarWrapper li').click(function () {
                var value = $('.textarea_c').val() + $(this).text() + ':\t\n';
                $('.textarea_c').val(value);
            })
        }
        if (str.indexOf('user.name') >= 0) {
            utils.popUpToggle($('.ggitPopup'), $('.popCancel')); // mark 
            localRepo.createCommitMsgHtml();
            moveHelpBarController();
            localRepo.requestToCommit();
        } else {
            utils.popUpToggle(`${switchLang('Please set git user and email ', '请先设置好用户和邮箱')}`, true);
        }
    }

    // 创建管理分支的 html
    LocalRepo.prototype.createManageBranchHtml = () => {
        const branch_a_tmp = JSON.parse(window.sessionStorage.branch_a);
        var otherBranch = '';
        branch_a_tmp.otherBranch.forEach(val => {
            otherBranch += `<option>${val}</option>`
        });
        var html = `<div class="branch_popup"><div class="current_branch">
                                <span>${switchLang('Current Branch', '当前分支')}:&nbsp</span>
                                ${branch_a_tmp.currentBranch}
                            </div>
                            <div class="other_branch">
                                <span>${switchLang('Other Branchs', '其他分支')}:&nbsp</span>
                                <select>${otherBranch}</select>
                            </div></div>
                            <input class="d create_branch" value="${switchLang('Create', '创建分支')}" type="button">
                            `
        $('.popContainer').append(html);
    }

    // 切换分支
    LocalRepo.prototype.switchBranch = () => {
        $('.other_branch select').change(function(){
            $.get('/item/branch/switch', { 
                branch: $('.other_branch select').val(),
                currentItem: sessionStorage.currentItem
            }, function(data){
                if(1 === data.code){
                    utils.ggitNotification(data.srv_msg);
                    setTimeout(()=>{
                        window.location.reload();
                    }, 2000);
                }else if(0 === data.code){
                    utils.ggitNotification(data.err_msg, true);
                }
            })
        })
    }

    LocalRepo.prototype.createBranchHtml = ()=>{
        const currentItem = window.sessionStorage.currentItem;
        if($('.create_branch').hasClass('clicked')){
            const val = checkInputValue($('.textarea_d').val());
            $.post('/item/branch/create', {
                branchName: val,
                cwd: currentItem
            }, function(data){
                
            })
        }
    }

    LocalRepo.prototype.createBranch = ()=>{
        $('.create_branch').click(function(){
            $('.branch_popup').empty();
            $('.create_branch').addClass('clicked');
            $('.branch_popup').append(`
                <textarea class='textarea_d'></textarea>
            `)
            localRepo.requestToCreateBranch();
        })
    }

    //管理分支
    LocalRepo.prototype.manageBranch = () => {
        utils.popUpToggle($('.ggitPopup'), $('.popCancel')) // mark
        localRepo.createManageBranchHtml();
        localRepo.switchBranch();
        localRepo.createBranch();
    }
    // 小功能区点击功能控制器
    LocalRepo.prototype.tinyFunctionController = () => {
        // 查看工作区
        $('.fa').click(function () {
            localRepo.checkWorkStation(sessionStorage.getItem('currentItem'));
        })
        //查看缓存区
        $('.fb').click(function () {
            localRepo.checkStage();
        })
        //查看仓库区
        $('.fc').click(function () {    

        })
        //分支管理
        $('.fd').click(function () {
            localRepo.manageBranch();
        })
        // 提交到仓库
        $('.fe').click(function () {
            localRepo.commitRepo();
        })
        // 查看日志
        $('.ff').click(function () {
            localRepo.checkGitLog();
        })
        // 版本回滚
        $('.fg').click(function () {

        })
        // 添加.git配置文件文件
        $('.fh').click(function () {
            localRepo.createConfigPopup();
        })
    }
    /**
     *@classdesc 本地仓库类 
     */
    function LocalRepo() {}
    const localRepo = new LocalRepo();
    exports.LocalRepo = LocalRepo;

    /**
     * -------------------------------------------------------------------------
     * @description  新建本地仓
     * @lastmodified 2019/2/1
     * --------------------------------------------------------------------------
     */

    // 请求初始化项目路径 
    CreateLocalRepo.prototype.requestInitItem = () => {
        const $path = $('.popContainer textarea').val().trim().replace(/\\$/g, '');
        const a = utils.checkIsAbsolutePath($path) ? true : utils.ggitNotification(`${switchLang('use absolute path','请使用绝对路径')}`);
        if (a) {
            // test path C:\Users\wangh\Desktop\demoJava
            $.post('/item/init', {
                path: $path
            }, function (data) {
                if (1 === data.code) {
                    utils.ggitNotification(data.srv_msg);
                    $('.ggitPopup').removeClass('showed').hide();
                    sessionStorage.setItem('currentItem', $path);
                    utils.saveHistoryStorage({
                        [new Date().toLocaleString()]: $path
                    });
                    localRepo.createOperateRepoHtml();
                    fsView.createFileSystemHtml($path, data.files, switchLang('WorkStation', '工作区'));
                    localRepo.tinyFunctionController();
                } else {
                    utils.ggitNotification(data.err_msg);
                }
            })
        }
    }
    // 创建项目点击控制器
    CreateLocalRepo.prototype.createLocalRepoController = () => {
        $('.repo_button').click(function () {
            createLocalRepo.requestInitItem();
        })
    }
    // 创建本地库地址填写html
    CreateLocalRepo.prototype.createLocalRepoHtml = () => {
        utils.popUpToggle($('.ggitPopup'), $('.popCancel')) // mark
        const desktop = JSON.parse(window.localStorage.getItem('env'))['desktop'];
        const html = `<textarea class='d textarea_a' placeholder='${switchLang('Item path', '项目地址')}'>${desktop || ''}</textarea>
                                <input class='d repo_button' value='${switchLang('Sure', '确定')}' type='button' >`
        $('.popContainer').append(html);
        utils.toggleTheme($('.popContainer').children());
    }

    //创建本地库, 呼出弹出窗
    function CreateLocalRepo() {
        this.createLocalRepoHtml;
        this.createLocalRepoController;
    }
    const createLocalRepo = new CreateLocalRepo();
    /**
     * -----------------------------------------------------------------------------
     * @description clone远程仓库
     * @lastModified 2019/1/25
     * -----------------------------------------------------------------------------
     */
    // 发送clone克隆请求 
    CloneRepo.prototype.requestClone = () => {
        const $cloneAddress = $('.cloneAddress').val(), $localAddress = $('.localAddress').val();
        const a = utils.checkHttpsUrl($cloneAddress) ? true : utils.ggitNotification(`${switchLang('use right path','使用正确的地址')}`),
                  b = utils.checkIsAbsolutePath($localAddress) ? true : utils.ggitNotification(`${switchLang('use absolute path','请使用绝对地址')}`);
        if (a && b && !$('.ggitPopup').hasClass('cloning')) {
            $('.ggitPopup').addClass('cloning');
            $('.ggitPopup').prepend(`<div class="cloneStatus">
                                                        <div></div><span>${switchLang('cloning','正在克隆......')}</span>
                                                    </div>`)
            $('.popCancel').click(function () {
                utils.ggitNotification(`${switchLang('running in the background','正在后台克隆')}`);
            })
            $.post('/clone/item', {
                remoteUrl: $cloneAddress,
                localUrl: $localAddress
            }, function (data) {
                $('.cloneStatus span').text(`${switchLang('cloning finish','克隆完成')} ^_^`);
                setTimeout(() => {
                    $('.cloneStatus').remove();
                }, 1000);
                if (1 === data.code) {
                    utils.ggitNotification(data.srv_msg);
                } else {
                    utils.ggitNotification(data.err_msg);
                }
                $('.ggitPopup').removeClass('cloning');
            })
        }
    }

    // 创建克隆界面
    CloneRepo.prototype.createCloneHtml = () => {
        utils.popUpToggle($('.ggitPopup'), $('.popCancel')) // mark
        const html = createTemplate(
            [
                ['p', 'clonePTag clone', false, createTemplate([
                    ['label', false, false, `${switchLang('Remote','远程地址')}`],
                    ['input', 'cloneRepo cloneAddress d', 'text']
                ])],
                ['p', 'clonePTag local', false, createTemplate([
                    ['label', false, false, `${switchLang('Local', '存放地址')}`],
                    ['input', 'cloneRepo localAddress d', 'text']
                ])],
                ['input', 'clone_button d', 'button', `${switchLang('Sure', '确定')}`]
            ]
        )
        $('.popContainer').append(html);
        utils.toggleTheme($('.popContainer input'));
        $('.popContainer .localAddress').val(JSON.parse(localStorage.getItem('env')).desktop);
    }

    // 克隆按钮控制器
    CloneRepo.prototype.cloneRepoController = () => {
        $('.clone_button').click(cloneRepo.requestClone);
    }
    /**
     * @classdesc 克隆对象
     */
    function CloneRepo() {
        this.createCloneHtml;
        this.cloneRepoController;
    }
    const cloneRepo = new CloneRepo();

    /**
     * --------------------------------------------------------------------------
     * @description git 设置选项
     * @lastModified 2019/1/23
     *---------------------------------------------------------------------------
     */

    //请求/config/adduser 添加git用户
    GlobalSetting.prototype.addGitUser = () => {
        const $username = $('#username').val();
        const $email = $('#email').val();
        const cUser = '' === $username ? utils.ggitNotification(`${switchLang('git user name','请输入用户名')}`, true) : true;
        const cEmail = checkEmail($email) ? true : utils.ggitNotification(`${switchLang('use right email format','请使用正确邮箱格式')}`, true)
        if (cUser && cEmail) {
            $.post('/config/adduser', {
                username: $username,
                email: $email
            }, function (data) {
                if (1 === data.code) {
                    utils.ggitNotification(data.srv_msg);
                } else {
                    utils.ggitNotification(data.err_msg, true, 5000);
                }
            })
        }
    }
    // 重置ssh
    GlobalSetting.prototype.resetSSH = ()=>{
        $('.reset_ssh').click(function(){
            $.get('/config/resetssh', { reset: 'true' },function(data){
                if(1 === data.code){
                    utils.ggitNotification(data.srv_msg);
                    window.location.reload();
                }else{
                    utils.ggitNotification(data.err_msg, true);
                }
            })
        })
    }   
    //type显示详情类型 显示git 配置详情 
    GlobalSetting.prototype.createDetailsHtml = (type) => {
        const $display = $('.settingDisplay');
        var reset_html = 
            `<input type="button" value="${switchLang("Reset SSH", "重置SSH")}" class="reset_ssh">`;
        var textarea_html = `<textarea class="d textarea_d"></textarea>`
        var html = 'keygen' === type ?  textarea_html + reset_html : textarea_html;
        $display.empty().append(html);
        const $textarea = $display.children('textarea');
        utils.toggleTheme($('.settingDisplay textarea'));
        switch (type) {
            case 'setting':
                (() => {
                    var config = window.sessionStorage.getItem('config');
                    config ? $textarea.text(config) : 
                    $textarea.text(`${switchLang('no setting details','暂无设置详情')}`);
                })();
                break;
            case 'keygen':
                (() => {
                    $.post('/config/keygen', function (data) {
                        $textarea.text(data.srv_msg || data.err_msg);
                    })
                })();
                break;
        }
    }
    // 生成git用户设置展示
    GlobalSetting.prototype.createSetUserHtml = () => {
        $('.settingDisplay').empty();
        const user = `
            <p>
                <span>${switchLang('User','用户')}</span>
                <input type="text" class="d req username" id="username" placeholder='${switchLang('Item', '项目')}'/>
            </p>
            <p>
                <span>${switchLang('Email', '邮箱')}</span>
                <input type="email" class="d req email" id="email" placeholder="github"/>
            </p>
            <input type="button" class="d submitBtn" value="${switchLang('Sure','确定')}"/>
        `
        $('.settingDisplay').append(user);
        // 黑夜模式
        utils.toggleTheme($('.settingDisplay input'));
    }
    // git 全局设置 控制器
    GlobalSetting.prototype.globalSettingController = () => {
        $('.setUser').click(function () {
            globalSetting.createSetUserHtml();
            $('.operateArea').find('.submitBtn').click(globalSetting.addGitUser);
        })
        $('.showSetting').click(function () {
            globalSetting.createDetailsHtml('setting');
        })
        $('.setKeygen').click(function () {
            globalSetting.createDetailsHtml('keygen');
            globalSetting.resetSSH();
        })
    }
    // 生成设置列表
    GlobalSetting.prototype.createSettingHtml = () => {
        $('.operateWrapper').empty();
        const settingHtml = 
        `<div class="settingLists">
            <ul>
                <li class="setUser d">
                    <div class="icon settingIcon"></div>
                    <div  class="icon settingTitle">
                        ${switchLang('User Setting', '用户设置')}
                    </div>
                </li>
                <li class="showSetting d">
                    <div class="icon settingIcon"></div>
                    <div class="icon settingTitle">
                        ${switchLang('Setting Details','设置详情')}
                    </div>
                </li>
                    <li class="setKeygen d">
                    <div class="icon settingIcon"></div>
                    <div class="icon settingTitle">
                        ${switchLang('Secret Key','密钥设置')}
                    </div>
                </li>
            </ul>
        </div><div class="settingDisplay"></div>`
        $('.operateWrapper').append(settingHtml);
        utils.toggleTheme($('.settingLists li'));
    }
    /**
     * @classdesc 全局设置
     * @lastmodified 2019/1/21
     */
    function GlobalSetting() {
        this.createSettingHtml;
        this.globalSettingController;
    }
    const globalSetting = new GlobalSetting();

    /**
     * --------------------------------------------------------------------------
     * @description 功能bar的功能 class functionBar
     * @lastModified 2019/1/27
     * --------------------------------------------------------------------------
     */

    FunctionBar.prototype.toggleDarkLight = () => {
        const theme = window.localStorage.getItem('currentTheme');
        if ('dark' === theme) {
            window.localStorage.setItem('currentTheme', 'light');
        } else {
            window.localStorage.setItem('currentTheme', 'dark');
        }
        utils.initDarkTheme();
    }

    /**
     * @classdesc 构造FunctionBar对象 ggitSetting类 功能
     */
    function FunctionBar() {}

    /**
     * ---------------------------------------------------------------------------
     * @description 功能控制器
     * @lastModified 2019/1/23
     * ---------------------------------------------------------------------------
     */
    FunctionLists.prototype.functionListsController = () => {
        // functionLists 区点击功能
        $('.diffCode').click(function () {
            alert('未实现');
        })
        //点击createLocalRepo 触发git初始化
        $('.createLocalRepo').click(function () {
            createLocalRepo.createLocalRepoHtml();
            createLocalRepo.createLocalRepoController();
        })
        // 点击globalsetting 触发git设置功能
        $('.globalSetting').click(function () {
            globalSetting.createSettingHtml();
            globalSetting.globalSettingController();
        })
        //点击cloneRepo 触发git克隆功能
        $('.cloneRepo').click(function () {
            cloneRepo.createCloneHtml();
            cloneRepo.cloneRepoController();
        })
        // FunctionBar区点击功能
        // 点击 切换黑夜模式 白天模式
        $('.ggitSetting li:eq(0)').click(function () {
            new FunctionBar().toggleDarkLight();
        })
        $('.ggitSetting li:eq(1)').click(function () {
            
        })
        $('.ggitSetting li:eq(2)').click(function () {

        })
        $('.ggitSetting li:eq(3)').click(function () {
            
        })
    }

    /**
     * @classdesc 功能类 git操作 等软件软件设置
     * @exports FunctionLists
     */

    function FunctionLists() {
        this.functionListsController();
    }
    exports.FunctionLists = FunctionLists;
})