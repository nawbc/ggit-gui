const fs = require('fs');
const { resolve } = require('path');

const path = resolve(__dirname, '../config/language.txt');
module.exports = (en, zh) => {
    var lang;
    try{
        lang = fs.readFileSync(path, { encoding: 'utf8'}).toString();
    }catch(err){
        return zh;
    }
    return  'en' === lang ? en : zh;
}
