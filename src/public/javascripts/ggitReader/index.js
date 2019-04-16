(function (global, factory) {
    factory(global);
})(this, function (exports) {
    // 继承主题
    (function () {
        const t = window.localStorage.getItem('currentTheme');
        if ('dark' === t) {
            utils.initDarkTheme();
        }
    })()
    /**
     * --------------------------------------------------------------------------------------
     * @description  ggit 离线阅读器
     * @lastmodified 2019/2/20
     * --------------------------------------------------------------------------------------
     */
    //文件系统视图 
    const fsView = new FsView();

    GGitReader.prototype.requestItemToLocal = (data) => {
        const $itemUrl = $('.native_remoteUrl').val();
        const a = utils.checkHttpsUrl($itemUrl) ? true :
            utils.ggitNotification(switchLang('Please Use Right Https Url', '请使用正确https地址'), true);
        if (true === a) {
            $(`<div class="addingNative">${switchLang('Adding.......', '正在添加.......')}</div>`).
            insertAfter($('.requestBlock').children('div:eq(0)'));

            $.post('/clone/item', {
                remoteUrl: $itemUrl,
                localUrl: data.srv_msg.nativePath
            }, function (data) {
                if (1 === data.code) {
                    $('.addingNative').remove();
                    // 储存羡慕到storage
                    utils.ggitNotification(switchLang('Add successfully', ' 添加成功'));
                    window.location.reload;
                    setTimeout(() => {
                        $('.cloneStatus').remove();
                        $('.ggitPopup').removeClass('showed').hide();
                    }, 1000);
                } else {
                    utils.ggitNotification(switchLang('Add failure', '添加失败'));
                }
            })
        }
    }

    //选择文件
    GGitReader.prototype.selectItem = (ele) => {
        const localPath = window.sessionStorage.nativePath + fsView.filePath.Sep() + ele.text().trim();
        fsView.requestFiles(localPath, (data) => {
            fsView.createFileSystemHtml(localPath, data.files, switchLang('WorkStation', '工作区'), (ele)=>{
                const url = ele.attr('title');
                ele.parents().children('li').removeClass('add');
                ele.addClass('add');
                $.post('/ggitreader/renderfile', { path: url } , (data)=>{
                    if(1 ===  data.code){
                        $('.markdownDisplayWrapper pre code').html(data.srv_msg);
                        $('.markdownDisplayWrapper pre code').each(function(i, block) {
                            hljs.highlightBlock(block);
                        });
                    }
                })
            }); 
        })
    }

    // 项目点击选择控制器
    GGitReader.prototype.selectItemController = (data) => {
        $('.native_button').click(function () {
            ggitReader.requestItemToLocal(data);
        })
        $('.selectBlockContainer li').click(function () {
            ggitReader.selectItem($(this));
            $('.ggitPopup').removeClass('showed').hide();
        })
    }
    // 创建项目选择 html
    GGitReader.prototype.createSelectItemHtml = (data) => {
        var nativeItemList = '';
        const nativeFiles = data.srv_msg.files;
        if (Array.isArray(nativeFiles)) {
            nativeFiles.forEach((val) => {
                nativeItemList += '<li>' + val + '</li>';
                const html = `<div class="ggitReader"><div class="selectBlock">
                                            <div>${switchLang('Select Item', '选择项目')}</div>
                                             <ul class="selectBlockContainer">${nativeItemList}</ul>
                                    </div>
                                    <div class="requestBlock">
                                        <div>${switchLang('Add Online To Native', '添加在线项目到本地')}</div>
                                        <p>
                                            <input type="text" placeholder="${switchLang('remote clone url', '项目克隆地址')}" class="native_remoteUrl" />
                                        </p>
                                        <input type="button" class="native_button" value='${switchLang('Sure', '确定')}' />
                                    </div></div>`
                $('.popContainer').empty().append(html);
            })
        }
    }
    // 初始化请求
    GGitReader.prototype.initRequest = (callback) => {
        $.get('/ggitreader/nativeitem', function (data) {
            callback(data);
        })
    }
    // 初始化 ggitreader
    GGitReader.prototype.init = () => {
        ggitReader.initRequest((data) => {
            if ('object' === typeof data) {
                window.sessionStorage.setItem('nativePath', data.srv_msg.nativePath);
                utils.popUpToggle($('.ggitPopup'), $('.popCancel')); // mark 
                ggitReader.createSelectItemHtml(data);
                ggitReader.selectItemController(data);
            } else {
                utils.ggitNotification(switchLang('Init failure', '初始化失败'));
            }
        })
    }

    function GGitReader() {}
    const ggitReader = new GGitReader();
    ggitReader.init();
})