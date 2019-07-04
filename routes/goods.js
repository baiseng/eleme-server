const express = require('express');
const router = express.Router();
const db = require('../models/table');
const sliceObj = require('../tools/sliceObj');
const UnFile = require('../tools/UnFile');


/*根拦截器
 */
router.all('*', (req, res, next) => {
    next()
});

/*获取单一商品
参数：id
 */
router.get('/', (req, res) => {
    if (req.query.id) {
        db.Goods.findOne({where: {id: req.query.id}})
    } else {
        res.json({ok: -1, msg: '拜托，给我一下要查询的id'})
    }
});


/*增加商品
参数：goodsTypeId,customId,name,price,desc,imgUrl,stock[,isDiscount,original]
 */
router.post('/', (req, res) => {
    if (req.userType === 2) {
        db.Store.findOne({where: {userId: req.userId}}).then(store => {
            if (store) {
                let {name, price, desc, imgUrl, stock, customId, goodsTypeId} = req.body;
                if (name && price && desc && imgUrl && stock && customId && goodsTypeId) {
                    let data = sliceObj(req.body, ['name', 'price', 'desc', 'imgUrl', 'stock', 'customId', 'isDiscount', 'original', 'goodsTypeId']);
                    data.storeId = store.id;
                    db.Goods.create(data).then(goods => {
                        if (goods) {
                            res.json({ok: 1, goods})
                        } else {
                            res.json({ok: -1, msg: '增加商品出了点问题，可能是没此goodsTypeId或者customId，也可能其他原因'})
                        }
                    });
                } else {
                    //todo 需要删除此处的无效图片
                    res.json({
                        ok: -1,
                        msg: '你必须给我name && price && desc && imgUrl && stock && customId && goodsTypeId,可选字段是isDiscount、original'
                    })
                }
            } else {
                res.json({ok: -1, msg: '你还没创建店铺呢'})
            }
        });
    } else {
        res.json({ok: -1, msg: '你注册成为商家我就告诉你'})
    }
});

/*上下架商品
参数：id
 */
router.delete('/', (req, res) => {
    if (req.userType === 2) {
        if (req.body.id) {
            db.Store.findOne({where: {userId: req.userId}}).then(store => {
                if (store) {
                    db.Goods.findOne({where: {id: req.body.id, storeId: store.id}}).then(goods => {
                        if (goods) {
                            goods.online = !goods.online;
                            goods.save();
                            res.json({ok: 1, goods})
                        } else {
                            res.json({ok: -1, msg: '要么上下架商品的id不存在，要么这个商品是隔壁店铺的'})
                        }
                    });
                } else {
                    res.json({ok: -1, msg: '你还没创建店铺呢'})
                }
            });
        } else {
            res.json({ok: -1, msg: '你倒是传一下上下架商品的id啊'})
        }
    } else {
        res.json({ok: -1, msg: '非商家'})
    }
});


/*修改商品
参数：id，name/price/desc/imgUrl/stock/customId/isDiscount/original/goodsTypeId/storeId
 */
router.post('/alter', (req, res) => {
    if (req.userType === 2) {
        if (req.body.id) {
            db.Store.findOne({where: {userId: req.userId}}).then(store => {
                if (store) {
                    db.Goods.findOne({where: {id: req.body.id, storeId: store.id}}).then(goods => {
                        if (goods) {
                            let data = sliceObj(req.body, ['name', 'price', 'desc', 'imgUrl', 'stock', 'customId', 'isDiscount', 'original', 'goodsTypeId', 'storeId']);
                            if (data.imgUrl) {
                                UnFile(goods.imgUrl)
                            }
                            Object.assign(goods, data);
                            goods.save().then(() => {
                                res.json({ok: 1, msg: '修改成功'})
                            });
                        } else {
                            res.json({ok: -1, msg: '不存在此商品，或者不属于你店铺'})
                        }
                    });
                } else {
                    res.json({ok: -1, msg: '你还没创建店铺呢，就改商品？'})
                }
            });
        } else {
            res.json({ok: -1, msg: '你倒是传一下修改商品的id啊'})
        }
    } else {
        res.json({ok: -1, msg: '非商家，不能开店，没开店，改什么？'})
    }
});

/*获取某店某自定义商品列表
参数：
type:1,2
type为1：获取本店某类商品列表,需customId
type为2：获取某店某类商品列表，需customId,storeId
 */
router.get('/listByCustomId', (req, res) => {
    let {type, customId, storeId} = req.query;
    if (customId) {
        type = type / 1;
        if (type === 1) {
            db.Store.findOne({where: {userId: req.userId}}).then(store => {
                if (store) {
                    db.Custom.findOne({where: {storeId: store.id, id: customId}}).then(custom => {
                        if (custom) {
                            custom.getGoods().then(goodsList => {
                                res.json({ok: 1, goodsList, msg: '获取本店某类商品列表'});
                            });
                        } else {
                            res.json({ok: -1, msg: '没有此自定义分类'})
                        }
                    })
                } else {
                    res.json({ok: -1, msg: '你没有商店'})
                }
            })
        } else if (type === 2) {
            if (storeId) {
                db.Goods.findAll({where: {storeId, customId}}).then(goodsList => {
                    if (goodsList.length) {
                        res.json({ok: 1, goodsList})
                    } else {
                        res.json({ok: -1, msg: '要么该类无数据，要么storeId、customId有问题'})
                    }
                })
            } else {
                res.json({ok: -1, msg: '获取他人店铺某类商品时，需要店铺id'})
            }
        } else {
            res.json({ok: -1, msg: 'type不匹配'})
        }
    } else {
        res.json({ok: -1, msg: '需要customId'})
    }

});

/*获取某店全部商品列表
type:1,2
type为1时：获取本店商品，不需要storeId
type为2时：获取某店商品，需要storeId
 */
router.get('/listByStoreId', (req, res) => {
    let {type, storeId} = req.query;
    if (type / 1 === 1) {
        if (req.userType === 2) {
            db.Store.findOne({where: {userId: req.userId}}).then(store => {
                if (store) {
                    store.getGoods().then(goodsList => {
                        res.json({ok: 1, goodsList});
                    });
                } else {
                    res.json({ok: -1, msg: '您还没有店铺，何来自己店铺商品'})
                }
            })
        } else {
            res.json({ok: -1, msg: '您不是商家，没有店铺'})
        }
    } else if (type / 1 === 2 && storeId) {
        db.Store.findOne({where: {id: storeId}}).then(store => {
            if (store) {
                store.getGoods().then(goodsList => {
                    res.json({ok: 1, goodsList})
                });
            } else {
                res.json({ok: -1, msg: '商店不存在'})
            }
        });
    } else {
        res.json({ok: -1, msg: '无效的type或者没有storeId'});
    }
});

/*获取全平台商品
参数：无
 */
router.get('/listAll', (req, res) => {
    db.Goods.findAll().then(goodsList => {
        res.json({ok: 1, msg: '返回的是全平台的商品，你确定你有此需求？', goodsList})
    })
});


/*获取全平台某类商品
参数：goodsTypeId
 */
router.get('/listByGoodsTypeId', (req, res) => {
    if (req.query.goodsTypeId) {
        db.GoodsType.findOne({where: {id: req.query.goodsTypeId}}).then(goodsType => {
            if (goodsType) {
                goodsType.getGoods().then(goodsList => {
                    res.json({ok: 1, goodsList, msg: '获取全平台某类商品'})
                });
            } else {
                res.json({ok: -1, msg: '无此分类'})
            }
        })
    } else {
        res.json({ok: -1, msg: '缺少goodsTypeId'})
    }
});

module.exports = router;
