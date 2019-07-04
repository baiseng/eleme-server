const fs=require('fs');
require('./dateFormat');
//let fsPath='./upload/img'+(new Date()).Format('/yyyy/MM/dd');

module.exports= function(fsPath) {
    let arr=fsPath.replace(/^[.]?\//,'').split('/');
    if (arr[0]==='..'){
        arr.splice(0,1);
        arr[0]='../'+arr[0]
    }
    arr.reduce((total,value)=>{
        if (!fs.existsSync(total)) {
            fs.mkdirSync(total);
        }
        return total+'/'+value;
    });
    if (!fs.existsSync(arr.join('/'))) {
        fs.mkdirSync(arr.join('/'))
    }
};
