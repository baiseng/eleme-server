const express = require('express');
const router = express.Router();
const db = require('../models/table');
const sliceObj = require('../tools/sliceObj');
const UnFile=require('../tools/UnFile');


//根拦截器
router.all('*', (req, res, next) => {
    next()
});

//获取单个自定义分类
//参数：id
router.get('/', (req, res) => {
    if (req.query.id) {
        db.Custom.findById(req.query.id).then(custom => {
            if (custom) {
                res.json({ok: 1, custom})
            } else {
                res.json({ok: -1, msg: '没有此id的自定义分类信息'})
            }
        })
    } else {
        res.json({ok: -1, msg: '获取单个自定义分类需要id'})
    }
});


//增加本店分类
//参数:name/img
router.post('/', (req, res) => {
    if (req.userType === 2) {
        if (req.body.name) {
            db.Store.findOne({where:{userId:req.userId}}).then(store=>{
                if (store) {
                    let data = sliceObj(req.body, ['name', 'img']);
                    data.storeId=store.id;
                    db.Custom.create(data).then(custom => {
                        if (custom) {
                            res.json({ok: 1, msg:'增加本店分类成功',custom})
                        } else {
                            res.json({ok: -1, msg: '增加本店分类失败,可能是商店id不存在'})
                        }
                    })
                }else {
                    res.json({ok:-1,msg:'你还没有开店呢，不能创建自定义分类'})
                }
            });
        }else{
            res.json({ok:-1,msg:'分类名称是必须提交的'})
        }
    } else {
        res.json({ok: -1, msg: '你不是商家,不能增加本店分类'})
    }
});

//删除本店自定义分类
//参数：id
router.delete('/', (req, res) => {
    db.Store.findOne({where:{userId:req.userId}}).then(store=>{
        if (store) {
            if (req.body.id) {
                db.Custom.destroy({where: {id: req.body.id,storeId:store.id}}).then(num => {
                    if (num) {
                        res.json({ok:1,msg:'成功删除'+num+'条自定义分类，该分类下的商品可能也被一并删除了！'});
                    } else {
                        res.json({ok:-1,msg:'删除自定义分类失败'})
                    }
                })
            } else {
                res.json({ok:-1,msg:'删除本店自定义分类必须提交id'})
            }
        }else {
            res.json({ok:-1,msg:'您还没有开店呢，如何删除自定义分类？'})
        }
    });
});


//修改本店自定义分类
//参数：id,name,img
router.post('/alter', (req, res) => {
    db.Store.findOne({where:{userId:req.userId}}).then(store=>{
        if (store) {
            if (req.body.id) {
                db.Custom.findOne({where:{id:req.body.id,storeId:store.id}}).then(custom=>{
                    if (custom) {
                        let data=sliceObj(req.body,['name','img']);
                        if (data.img){
                            UnFile(custom.img)
                        }
                        Object.assign(custom,data);
                        custom.save().then(()=>{res.json({ok:1,msg:'成功修改自定义分类'})});
                    }else {
                        res.json({ok:-1,msg:'不存在此自定义id，或者这条id不属于你'})
                    }
                });
            } else {
                res.json({ok:-1,msg:'修改本店自定义分类必须提交id'})
            }
        }else {
            res.json({ok:-1,msg:'您还没有开店呢，如何修改自定义分类？'})
        }
    });
});

//获取某店分类列表
//type为1：获取本店自定义分类列表
//type为2，获取他人店铺自定义列表，需要storeId
router.get('/list', (req, res) => {
    let {type,storeId}=req.query;
    type=type/1;
    if (type === 1) {
        db.Store.findOne({where:{userId:req.userId}}).then(store=>{
            if (store) {
                res.json({ok:1,customList:store.getCustom()})
            }else {
                res.json({ok:-1,msg:'您没有店铺'})
            }
        })
    }else if (type === 2 && storeId) {
        db.Store.findOne({where:{id:storeId}}).then(store=>{
            if (store) {
                res.json({ok:1,customList:store.getCustom()})
            }else {
                res.json({ok:-1,msg:'没有此店铺,店铺id有点问题'})
            }
        })
    }else {
        res.json({ok:-1,msg:'type不匹配或者没有storeId'})
    }
});

module.exports = router;
