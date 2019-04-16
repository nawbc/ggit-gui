(function(global, factory){
    factory(global);
})(this, function(exports){
    'use strict'

    const swicthLanguage = () => {
        $('.popContainer').empty();
        utils.popUpToggle($('.ggitPopup'), $('.popCancel'));
        const html = `
            <div class="selectLanguage">
                <section>语言/language</section>
                <div>
                    <input type="button" value="中文" class="language_cn">
                    <input type="button" value="English" class="language_en">
                </div>
            </div>`
        $('.popContainer').append(html);
        $('.language_cn').click(function(){
            window.localStorage.setItem('language', 'zh');
            $('.ggitPopup').hide();
            $.post('/index/setlanguage', { lang: 'zh'});
            utils.ggitNotification('默认中文');
            location.href = location.origin + location.pathname + '?lang=zh';
        });
        $('.language_en').click(function(){
            window.localStorage.setItem('language', 'en');
            $('.ggitPopup').hide();
            utils.ggitNotification('Default English');
            $.post('/index/setlanguage', { lang: 'en' });
            location.href = location.origin + location.pathname + '?lang=en';
        });
    }

    $.post('/index/getlanguage', (data)=>{
        if(1 === data.code ){
            window.localStorage.setItem('language', data.srv_msg);
        }else{
            swicthLanguage();
        }
    })

    /**
     * @exports Funtition 判断语言
     */
    exports.switchLang =  (str1, str2) =>  window.localStorage.getItem('language') === 'en'? str1: str2;
})


