var express = require('express');
var router = express.Router();
const db = require('../models/table');
const sliceObj = require('../tools/sliceObj');

//根拦截器
router.all('*', (req, res, next) => {
    if (req.userType === 1) {
        next()
    } else {
        res.json({ok: -1, msg: '你用户类型非顾客，不能操作购物车'})
    }
});

//获取一条购物车
//参数：id
router.get('/', (req, res) => {
    let {id} = req.query;
    if (id) {
        db.Cart.findOne({where: {id}}).then(cart => {
            if (cart) {
                res.json({ok: 1, cart})
            } else {
                res.json({ok: -1, msg: '查看单条购物车商品不存在此id'})
            }
        })
    } else {
        res.json({ok: -1, msg: '查看单条购物车需要id'})
    }
});


//增加一条购物车
//参数：num,goodId
router.post('/', (req, res) => {
    let {num, goodId} = req.body;
    if (num && goodId) {
        db.Cart.findOne({where: {goodId, userId: req.userId}}).then(cart => {
            if (cart) {
                cart.num += num;
                cart.save();
                res.json({ok: 1, msg: '已有此商品的购物车，增加数量成功', cart})
            } else {
                db.Cart.create({num, goodId, userId: req.userId}).then(cart => {
                    if (cart) {
                        res.json({ok: 1, msg: '创建一条购物车', cart})
                    } else {
                        res.json({ok: -1, msg: '创建一条购物车失败，可能是商品id有问题'})
                    }
                })
            }
        });
    } else {
        res.json({ok: -1, msg: '添加购物车必须提交数量num与商品id'})
    }
});

//删除一条购物车
//参数id
router.delete('/', (req, res) => {
    let {id} = req.body.id;
    if (id) {
        db.Cart.destroy({where: {id, userId: req.userId}}).then(num => {
            if (num) {
                res.json({ok: 1, msg: '删除' + num + '条数据购物车'})
            } else {
                res.json({ok: -1, msg: '删除0条数据，可能你提交的id有误'})
            }
        })
    } else {
        res.json({ok: -1, msg: '删除单条购物车必须提交id'})
    }
});


//修改一条购物车
//参数id,num
router.post('/alter', (req, res) => {
    let {num, id} = req.body;
    if (num && id) {
        db.Cart.update({num}, {where: {id, userId: req.userId}}).then(numArr => {
            if (numArr[0]) {
                res.json({ok: 1, msg: '成功修改' + numArr[0] + '条数据'})
            } else {
                res.json({ok: -1, msg: '修改0条数据,可能你无此购物车id'})
            }
        })
    } else {
        res.json({ok: -1, msg: '修改购物车必须提交num与id'})
    }
});

//购物车列表
router.get('/list', (req, res) => {
    db.Cart.findAll({where: {userId: req.userId}}).then(cartList => {
        if (cartList.length) {
            res.json({ok: 1,cartList})
        } else {
            res.json({ok: -1, msg: '你购物车是不是空了！'})
        }
    })
});

module.exports = router;
