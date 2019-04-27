(function(global, factory){
    factory(global);
})(this, function(exports){
    'use strict'
    /**============================================================================================
     * @description  适配操作系统路径
     * @lastmodified  2019/2/19
     *==============================================================================================
     */
    /**
     * @param { String } os JSON.parse(localStorage.getItem('aboutApp'))['system:操作系统'];
     */
    function Sep(){
        const os = JSON.parse(localStorage.aboutApp)['system:操作系统'];
        if ('windows' === os) {
            return '\\';
        } else if ('Linux' === os || 'linux' === os) {
            return '/';
        } else {
            return '/';
        }
    }
    /**
     * 创建一个FilePath类  包含Sep返回操作系统分隔符
     * @class 
     * @public
     */
    function FilePath (){
        this.Sep = Sep
    }
    var filePath = new FilePath();

    /**==================================================================================================
     * @lastmodified 2019/2/20
     * @description  文件操作视图
     * ================================================================================================== 
     */
    /**
     * @param { String } 基础路径
     * @param { Array } 文件
     * @param { String } 
     */
    FsView.prototype.dblclickAction = (callback)=>{
        $('.tinyWrapper ul li').dblclick(function () {
            if ('dir' === $(this).children('div:eq(1)').attr('class')) {
                const src = $(this)[0].title;  
                // default
                fsView.requestFiles(src, (data)=>{
                    fsView.createFileSystemHtml(src, data.files, switchLang('WorkStation', '工作区'), callback);
                    utils.operateTempStorage(null, 'removeAll'); 
                });
            }
        })
    }
    // 单击标记进入缓存区
    FsView.prototype.addToTempStage = (callback)=>{
        $('.tinyWrapper ul li').click(function () {
            if ('dir' !== $(this).children('div:eq(1)').attr('class')) {
                if('function' !== typeof callback){
                    if ($(this).hasClass('add')) {
                        $(this).removeClass('add');
                        utils.operateTempStorage($(this).children('span').text(), 'remove');
                    } else {
                        $(this).addClass('add');
                        utils.operateTempStorage($(this).children('span').text(), 'add');
                    }
                }else{
                    callback($(this));
                }
            }
        })
    }
    // 返回上级目录
    FsView.prototype.backToPreFold = (path, callback)=>{
        $('.tinyWrapper .back').click(function () {
            var a;
            var prePath;
            var limitPath;
            localStorage.getItem('aboutApp');
            limitPath = JSON.parse(localStorage.getItem('env'))['homedir'];
            a = path.split(fsView.Sep());
            a.splice(a.length - 1, 1);
            prePath = a.join(fsView.Sep());
            if (prePath == limitPath) {
                utils.ggitNotification(`${switchLang('Beyond my power', '超出势力范围')}`, true);
                return false;
            }
            fsView.requestFiles(prePath, (data)=>{
                fsView.createFileSystemHtml(prePath, data.files, switchLang('WorkStation', '工作区'), callback);
            });
        })    
    }

    // 文件点击控制器
    FsView.prototype.foldClickController = (path, callback)=>{
        fsView.dblclickAction(callback);
        fsView.addToTempStage(callback);
        fsView.backToPreFold(path, callback);
    }

     // 判断是文件还是目录
     FsView.prototype.handleFileExtName = (name) => {
        const arr = name.split('.');
        const ext = arr[arr.length - 1];
        if (1 === arr.length) {
            return 'unknown'
        } else if ('html' === ext || 'htm' === ext) {
            return 'html';
        } else if ('jpg' === ext || 'png' === ext || 'git' === ext || 'svg' === ext) {
            return 'img'
        } else if ('word' === ext) {
            return 'word';
        } else if ('pdf' === ext) {
            return 'pdf';
        } else {
            return 'file';
        }
    }
    // 创建文件视图
    /**
     * @param { String } basepath
     * @param { Array } files [['xxx', 'xxx', '2018/321/132']]
     * @param { String } currentTree 
     */
    FsView.prototype.createFileSystemHtml = (basePath, files, currentTree, callback) =>{
        var block = '', branch_a = window.sessionStorage.branch_a;
        console.log(branch_a)
        var current = JSON.parse(branch_a);
        files.forEach((val) => {
            const url = [basePath, val[0]].join(filePath.Sep());
            const a = 'file' === val[1] ? fsView.handleFileExtName(val[0]) : 'dir';
            block += `<li title="${url}" class="fileBlock">
                                <div>${val[2]}</div>
                                <div class="${a}"></div>
                                <span>${val[0]}</span>
                            </li>`
        })

        var statusBlockHtml =
            `<div class="statusbar" title="${basePath}">
                    <ul>
                        <li id="workStation">${currentTree}:&nbsp</li><li>${basePath}</li>
                    </ul>
                    <ul>
                        <li id="currentBranch">${switchLang('Current Branch','当前分支')}:</li>
                        <li>
                            ${ branch_a ?
                                (current.hasOwnProperty('currentBranch') ? 
                                current.currentBranch:
                                switchLang('None', '未知')): 
                                switchLang('None', '未知') }
                        </li>
                    </ul>
            </div><div class="back">${switchLang('Back', '返回上一级')}</div>`

        var fsViewHtml = `${statusBlockHtml}<ul class='fileWrapper'>${block}</ul>`
        utils.toggleTheme($('.back'))
        $('.tinyWrapper').empty().append(fsViewHtml);
        fsView.foldClickController(basePath, callback);
    }
    // 请求文件
    FsView.prototype.requestFiles = (localSrc, callback)=>{
        $.post('/item/files', { path: localSrc }, function (data) {
            $('.tinyWrapper').empty();
            callback(data);
        })
    }
    
    FsView.prototype.filePath = filePath;
    // 文件点击控制器

    /**
    * 
    * @public
    * @modules 
    * @extends FilePath
    */
    function FsView(){
        FilePath.call(this);
    }
    const fsView = new FsView();
    exports.FsView = FsView;
})


