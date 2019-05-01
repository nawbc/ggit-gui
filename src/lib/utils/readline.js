module.exports = (data, saver, endSign,callback) => new Promise((resolve, reject) => {
    const handler = (data, start = 1) => {
        var end, lineString = '';
        end = data.indexOf(endSign, start);
        if(end === -1){
            lineString = data.slice(start-1, data.length);
        }else{
            lineString = data.slice(start-1, end);
        }
        callback(lineString, saver);
        if (end < 0) {
            resolve(saver);
            return 0;
        }
        handler(data, end + 1);
    }
    handler(data.trim());
})



