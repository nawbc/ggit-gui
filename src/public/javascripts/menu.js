(function(global, factory){
    factory(global)
})(this, function(exports){
    'use strict'
    const { val } = utils;
    const backBtn = `<div id='backBtn' class='backToList'>${switchLang('back','返回')}</div>`;

    const renderAbout = (data) => {
        let html = [];
        for(let prop in data){
            var a = prop.split(':');
            html.push(`<li><span>${switchLang(a[0], a[1])}</span>:&nbsp<span>${data[prop]}</span></li>`);
        }
        let aboutAppList = `<ul class='aboutApp'>${html.join('')}</ul>${backBtn}`;
        setTimeout(()=>{
            $('.menuList').prepend(aboutAppList);
            $('#backBtn').click(function(){
                $(this).hide();
                $('.aboutApp').hide();
                $('.menuContainer').fadeIn(200);
                $('.aboutWrapper').fadeIn(200);
                utils.removeClicked($('.aboutAuthor'));
            })
        }, 200)
    }
    
    const initAbout = ()=>{
        const $aboutAuthor = $('.aboutAuthor');
        if(utils.isClicked($aboutAuthor)){
            $('.menuContainer').fadeOut(200);
            $aboutAuthor.children('.aboutWrapper').addClass('displayNone').fadeOut(200);
            
            if(utils.isExistStorage('aboutApp')){
                renderAbout(JSON.parse(localStorage.getItem('aboutApp')));    
            }else{
                $.get('/index/about', function(data){
                    localStorage.setItem('aboutApp', JSON.stringify(data));
                    renderAbout(data);
                }) 
            }
        }
    }

    const menuOutAndIn = ()=>{
        const $isOut = $('.menuList').hasClass('menuListOut');
        if(!$isOut){
            $('.menuBtn').addClass('menuBtnOut');
            $('.menuList').addClass('menuListOut');
        }else{
            $('.menuBtn').removeClass('menuBtnOut');
            $('.menuList').removeClass('menuListOut');
        }
    }
    const  createMenuListHtml = ()=>{
        $('.menuList').empty();
        var html = `<ul class="menuContainer">
                            <li><a href="/github" async="async">${switchLang('My GGithub', '我的GGithub')}</a></li>
                            <li><a href="/ggitreader/index">${switchLang('Git Usage','Git使用教程')}</a></li>
                            <li><a href="/ggitreader/index">${switchLang('GGit Offline Reader', 'GGit离线阅读')}</a></li>
                            <li><a></a></li>
                            <li><a></a></li>
                        </ul>
                        <div class="aboutAuthor">
                            <div class="aboutWrapper">
                                <div class="authorIcon"></div><span>${switchLang('About App', '关于软件')}</span></div>
                            </div>
                        </div>
                        `
        $('.menuList').append(html)
    }
    // 侧边菜单 
    const menuController= () => {
        $('.menuBtn').click(function(){
            createMenuListHtml();
            menuOutAndIn();
            $('.aboutAuthor').click(initAbout)
        })
    }

    /**
     * @description  右击菜单
     * @lastmodified 2019/1/28
     * @todo 完成右击重构右击菜单， 阻止原生事件, 定位元素，功能判断
     */
    const menuContent = (argv)=>{
        var li = '';
        argv.forEach((ele, index) => {
            li += `<li class="${ele[0]}">${ele[1]}</li>`
        });
        return '<div class="contextMenu" id="contextMenu"><ul>' + li +'</ul></div>';
    }
            
    const contextMenuFunc = (e)=>{
        const element = e.target;
        
        // 判断当前是否是查看查看工作区界面  
        if($(element).parents('.fileBlock').hasClass('fileBlock') || $(element).hasClass('fileBlock')){
            $('body').prepend(menuContent([
                ['addFold', switchLang('Add','添加')],
                ['removeFold', switchLang('Delete','删除')],
                ['selectAll', switchLang('All Select', '全选')],
                ['cancelSelect', switchLang('Cancel Select','取消全选')],
                ['addToStage', switchLang('Add To Stage', '添加至缓存区')],
                ['refresh', switchLang('Refresh', '刷新')]
           ]));
           $('.contextMenu').css({'left': e.clientX, 'top': e.clientY}); 
       }
        // 判断当前是否是查看日志界面  
        else if($(element).parents('.echoVersion').hasClass('echoVersion')){
             $('body').prepend(menuContent([
                ['copyHash', switchLang('Copy Hash','复制版本号')],
                ['backToThisVersion', switchLang('Back this Version','回滚至该版本')],
                ['refresh', switchLang('Refresh', '刷新')]
            ]));
            $('.contextMenu').css({'left': e.clientX, 'top': e.clientY}); 
        }else if($(element).parents('.operateHistory').hasClass('operateHistory')){
            $('body').prepend(menuContent([
                ['clearHistory', switchLang('ClearHistory', '清除记录')]
            ]))
            $('.contextMenu').css({'left': e.clientX, 'top': e.clientY}); 
        }else {
            $('body').prepend(menuContent([
                ['refresh', switchLang('Refresh', '刷新')]
            ]));
            $('.contextMenu').css({'left': e.clientX, 'top': e.clientY}); 
        }

        //fuck fuck fuck fuck
        $('.contextMenu li').click(function(e){
            e.preventDefault();
            // 添加文件夹， 添加sessionStorage 记录
            if($(this).hasClass('addFold')){
                var $fileBlock = $(element).parent().hasClass('fileWrapper') ? $(element) : $(element).parent();
                if(!$fileBlock.hasClass('add')){
                    utils.operateTempStorage($fileBlock.find('span').text(), 'add');
                    $fileBlock.addClass('add');
                }
            }
            // 删除文件夹， 并删除sessionStorage 记录
            if($(this).hasClass('removeFold')){
                var $fileBlock = $(element).parent().hasClass('fileWrapper') ? $(element) : $(element).parent();
                utils.operateTempStorage($fileBlock.find('span').text(), 'remove');
                $fileBlock.removeClass('add');
            }
            // 全选
            if($(this).hasClass('selectAll')){
                if($(element).parents('.echoVersion').hasClass('echoVersion')){ return false; }
                $('.fileWrapper li').addClass('add');
                window.sessionStorage.removeItem('tempStageFiles');
                utils.operateTempStorage('all', 'addAll');
            }
            // 取消全选
            if($(this).hasClass('cancelSelect')){
                if($(element).parents('.echoVersion').hasClass('echoVersion')){ return false; }
                $('.fileWrapper li').removeClass('add');
                utils.operateTempStorage(null, 'removeAll');
            }
            // 复制hash版本, 添加到剪贴板
            if($(this).hasClass('copyHash')){
                $('.tempSaveVal').val($(element).parents('.echoVersion').find('.hashVersion span:eq(1)').text());
                $('.tempSaveVal')[0].select();
                document.execCommand('copy');
                utils.ggitNotification(`${switchLang('Copied to Clipboard','已复制到剪贴板')}`);
            }
            // 添加选中的文件到缓存区
            if($(this).hasClass('addToStage')){
                const stageFiles = window.sessionStorage.getItem('tempStageFiles');
                const path = window.sessionStorage.getItem('currentItem');
                if($(element).parents('.echoVersion').hasClass('echoVersion')){ return false; }
                if('' === stageFiles || !stageFiles){ utils.ggitNotification(`${switchLang('No Files add', '没有文件添加')}`, true); return false};
                $.post('/item/addtostage',  { willStage :  stageFiles, path: path }, function(data){
                    utils.operateTempStorage(null, 'removeAll');
                    if(1 === data.code){
                        utils.ggitNotification(data.srv_msg);
                        $('.fileWrapper li').removeClass('add');
                    }else{
                        utils.ggitNotification(data.err_msg, true, 6000);
                    }
                })
            }

            // 清除历史记录
            if($(this).hasClass('clearHistory')){
                window.localStorage.removeItem('history');
                location.reload();
            }
            // 回滚到当前版本
            if($(this).hasClass('callThisVersion')){    
                
            }
            // 刷新界面 固定位置
            if($(this).hasClass('refresh')){
                window.location.reload();
            }
            $('.contextMenu').remove();
        })
    }
    const contextMenuController = ()=>{
        // 菜单控制
        document.oncontextmenu = (e) => {
            e.preventDefault();
            $('.contextMenu').remove();
            contextMenuFunc(e);
        }
        // 点击空白处收起菜单
        document.getElementsByTagName('main')[0].onclick = (e)=>{
            e.preventDefault();
            $('.contextMenu').remove();
        }
    }
    class Menu{
        constructor(){
            menuController();
            contextMenuController();
        }
    }
    exports.Menu = Menu;
})