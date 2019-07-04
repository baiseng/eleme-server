const fs=require('fs');
module.exports=function (file) {
    // windows系统与mac不同
    // let path='../upload'+file;      //windows
    let path='./upload'+file;
    if (fs.existsSync(path)) {
        fs.unlinkSync(path)
    }
};