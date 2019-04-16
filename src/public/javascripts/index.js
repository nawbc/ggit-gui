(function(global, factory){
    factory();
})(this, function(){
    'use strict'
    /***
     * @description 首次渲染请求
     * @lastmodified 2019/1/29
     */

    const initRequest = (()=>{
        $.post('/index/status',  function(status){
            'true' === JSON.parse(status).onLine  ?
            utils.ggitNotification(`${switchLang('Online Mode','在线模式')}`): 
            utils.ggitNotification(switchLang('Offline Mode','离线模式'));
            localStorage.getItem('env') ? null: localStorage.setItem('env', status);
        })
        $.post('/config/initgit', (data)=>{
            utils.ggitNotification(data.srv_msg);
            window.sessionStorage.setItem('config', data.data_msg);
        })
        $.post('/index/about', function(data){
            localStorage.setItem('aboutApp', JSON.stringify(data));
        })
    })()
    //初始化主题
    const renderInitTheme = (()=>{
        const t = window.localStorage.getItem('currentTheme');
        if('dark' === t){
            utils.initDarkTheme();
        }
    })()
    // 渲染历史操作界面
    const renderHistory = (()=>{
        $('.operateWrapper').empty();
        var html = '';
        const storage = JSON.parse(window.localStorage.getItem('history'));
        for(let date in storage){
            html += `<li title="${storage[date]}">
                                <div>${switchLang('Date', '日期')}: ${date}</div>
                                <div>${switchLang('Date','路径')}: ${storage[date]}</div>
                            </li>`
        }
        $('.operateWrapper').append('<ul class="operateHistory">'+
                                                `<li>${switchLang('Operate Record','操作记录')}</li>` +  html +
                                            '</ul>');
        utils.toggleTheme($('.operateHistory li'));
        
        $('.operateHistory li').click(function(){
            const src = $(this)[0].title;
            if(src){
                const localRepo = new LocalRepo();
                sessionStorage.setItem('currentItem', src);
                localRepo.checkWorkStation(src);
            }
        })
    })()

    /**
     *@description 全局事件
     * @lastmodfied 2019/1/17
     */
    
    GlobalEvent.prototype.shortCutsKey = ()=>{
        document.onkeydown = (e)=>{
            /**
             * @description  tab 弹出隐藏的mmenu   临时解决禁掉tab
             */
            if('Tab' === e.key){e.preventDefault();}    
        }
    }
    /**
     * @description 
     * @classdesc 全局事件类
     */
    function GlobalEvent (){
        this.shortCutsKey();
    }
    
    // 创建首页功能
    const createIndexPage = (() => {
        const menu = new Menu();
        const gloabl = new GlobalEvent();
        const functionLists = new FunctionLists(); 
    })()
})
