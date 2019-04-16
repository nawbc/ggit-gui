'use strict'
/**
 * @classdesc this is a global utils
 */

class Utils{
    constructor(){
        this.notificationQueue = [];
        this.ggitNotification = this.ggitNotification.bind(this);
        this.tempStageFiles = [];
    }
    // 储存操作记录到localStorage
    saveHistoryStorage(data, key='history'){
        var s = window.localStorage.getItem(key);
        if(s){
            var h = JSON.parse(s);
            window.localStorage.setItem(key, JSON.stringify(Object.assign(h, data)));
        }else{
            window.localStorage.setItem(key, JSON.stringify(data));
        }
    }
    // 添加将要缓存区的文件
    operateTempStorage(data, type, key='tempStageFiles'){

        if('add' === type){
            this.tempStageFiles.push(data);
            window.sessionStorage.setItem(key, this.tempStageFiles);
        }else if('addAll' === type ){
            sessionStorage.setItem(key, 'all');
        }else if('removeAll' === type){
            this.tempStageFiles = [];
            window.sessionStorage.removeItem(key);
        }else if('remove' === type){
            var a = this.tempStageFiles;
            var index = a.indexOf(data);
            this.tempStageFiles.splice(index, 1);
            window.sessionStorage.setItem(key, this.tempStageFiles);
        }
    }
    // 切换主题
    toggleTheme(ele){
        if($('body').hasClass('dark')){
            ele.addClass('deepdark d');
        }
    }
    initDarkTheme(){
        $('.ggitSetting li:eq(0)').toggleClass('darkBulb');
        $('body').toggleClass('dark');
        $('.ggitPopup').toggleClass('dark');
        $('.d').toggleClass('deepdark');
    }
    
    isClicked(ele){
        if(ele.hasClass('clicked')){
            return false;
        }else{
            ele.addClass('clicked');
            return true;
        }
    }
    removeClicked(ele){
        if(ele.hasClass('clicked')){
            ele.removeClass('clicked');
        }
    }
    popUpToggle(ele, cele){
        if($('body').hasClass('dark')){
            ele.addClass('deepdark');
        }
        $('.popContainer').empty();
        if(!ele.hasClass('showed')){
            ele.addClass('showed').show();
            cele.click(function(){
                ele.removeClass('showed').hide();
            })
        }
    }
    // 检查https 地址
    checkHttpsUrl (addr) {
        const reg = /^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/;
        return reg.test(addr);
    }
    // 检查是否是绝对路径
    checkIsAbsolutePath(path) {
        return /^\/|^[a-zA-Z]:/.test(path);
    }



    // localStorage是否存在
    isExistStorage( argv ){
        return window.localStorage.getItem( argv ) ? true : false;
    }

    /**
     * @param { String } content  * @param { Number } time 
     */
    
    ggitNotification(content, warn , time=3000){
        const $isShowed = $('.mrInform').css('display') !== 'none'
        let queue = this.notificationQueue;
        queue.push(content);
        
        if($isShowed){
            var no = this.ggitNotification;
            setTimeout(()=>{
                no(queue.shift(), warn);
            }, time);
        }else{
            $('.mrInform').show();
            if(warn){ 
                $('.mrInform .informIcon').addClass('warning');
            }else{
                $('.mrInform .informIcon').removeClass('warning');
            }
            $('.mrInform span').text(queue.shift());
            setTimeout(function(){
                $('.mrInform').hide();
            },time)
        }
    }
    
}

const utils = new Utils();




