const jwt_simple=require('jwt-simple');
const secret='swmonk.top';
module.exports={
    decode(token){// 解密
        try{
            const info = jwt_simple.decode(token,secret);
            if(info.lastTime < Date.now()){
                return {
                    ok:-2,
                    msg:"token过期了"
                }
            }else{
                return {
                    ok:1,
                    msg:"token验证成功",
                    ...info
                }
            }
        }catch (err){
            return {
                ok:-2,
                msg:"token解析失败"
            }
        }
    },
    //obj包含id与phone
    encode(obj){// 加密  生成token
        return jwt_simple.encode({
            ...obj,
            lastTime:Date.now() + (30*24*60 * 60 *1000)
        },secret)
    }
};