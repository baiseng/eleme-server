const express = require('express');
const router = express.Router();
const db = require('../models/table');
const sliceObj = require('../tools/sliceObj');
const UnFile=require('../tools/UnFile');


/*根拦截器
 */
router.all('*', (req, res, next) => {
    next()
});

/*获取店铺
参数：type,id     type=1代表获取自己的店铺，无需提交店铺id，type=2代表通过id获取店铺,需要店铺id
 */
router.get('/', (req, res) => {
    let {type, id} = req.query;
    if (type / 1 === 1) {
        if (req.userType === 2) {
            db.Store.findOne({where: {userId: req.userId}}).then(store => {
                if (store) {
                    res.json({ok: 1, store})
                } else {
                    res.json({ok: -1, msg: '您还没有店铺，赶紧创建吧'})
                }
            })
        } else {
            res.json({ok: -1, msg: '您不是商家，没有店铺'})
        }
    } else if (type / 1 === 2 && id) {
        db.Store.findOne({where: {id}}).then(store => {
            if (store) {
                res.json({ok: 1, store})
            } else {
                res.json({ok: -1, msg: '商店不存在'})
            }
        });
    } else {
        res.json({ok: -1, msg: '无效的type或者没有id'});
    }

});

/*创建店铺
name/img/addr/phone
 */
router.post('/', (req, res) => {
    if (req.userType===2) {
        db.Store.findOne({where:{userId:req.userId}}).then(store=>{
            if (store) {
                res.json({ok:-1,msg:'每个账户只能创建一个店铺，您已经创建过了'})
            }else {
                let data=sliceObj(req.body,['name','img','addr','phone']);
                data.userId=req.userId;
                db.Store.create(data).then(store=>{
                    if (store) {
                        res.json({ok:1,store})
                    }else {
                        res.json({ok:-1,msg:'创建店铺失败'})
                    }
                })
            }
        });

    }else {
        res.json({ok:-1,msg:'您非商家，不能创建店铺'})
    }
});

/*修改店铺
name/img/addr/phone
 */
router.post('/alter', (req, res) => {
    if (req.userType === 2) {
        db.Store.findOne({where:{userId:req.userId}}).then(store=>{
            if (store) {
                let data=sliceObj(req.body,['name','img','addr','phone']);
                if (data.img){
                    UnFile(store.img)
                }
                Object.assign(store,data);
                store.save().then(()=>{
                    res.json({ok:1,msg:'修改成功'})
                });
            }else {
                res.json({ok:-1,msg:'你没有创建店铺'})
            }
        });
    }else{
        res.json({ok:-1,msg:'您非商家，无店铺可更改'})
    }
});

/*获取店铺列表
 */
router.get('/list', (req, res) => {
    db.Store.findAll().then(storeList=>{
        res.json({ok:1,storeList})
    });
});

/*删除店铺
 */
router.delete('/', (req, res) => {
    res.json({
        ok: -1,
        msg:'危险操作，暂未开发'
    })
});
module.exports = router;



