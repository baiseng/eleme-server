const express = require('express');
const router = express.Router();
const db = require('../models/table');
const sliceObj = require('../tools/sliceObj');


/*根拦截器
 */
router.all('*', (req, res, next) => {
    next()
});

/*获取单个地址
参数：id
 */
router.get('/', (req, res) => {
    let id = req.query.id;
    if (id) {
        db.Address.findOne({where: {id: req.query.id}}).then(address => {
            if (address) {
                res.json({ok: 1, address})
            } else {
                res.json({pk: 1, msg: '没有此id的地址'})
            }
        });
    } else {
        res.json({ok: -1, msg: '参数必须有地址id'})
    }
});

/*增加地址
  name,phone,addr,isDefault
 */
router.post('/', (req, res) => {
    if (req.userType === 1) {
        let data = sliceObj(req.body, ['name', 'phone', 'addr', 'isDefault']);
        db.Address.create(data).then(address => {
            db.User.findOne({where: {id: req.userId}}).then(user => {
                user.addAddress(address);
                res.json({ok: 1, msg: '成功为您添加一条地址'})
            })
        });
    } else {
        res.json({ok: -1, msg: '您非顾客，不能添加地址'});
    }
});

/*删除地址
参数id
 */
router.delete('/', (req, res) => {
    if (req.userType === 1) {
        let {id} = req.body;
        db.Address.destroy({where: {id, userId: req.userId}}).then(num => {
            if (num) {
                res.json({ok: 1, msg: '成功删除' + num + '条地址'})
            } else {
                res.json({ok:-1,msg:'删除地址的id不对，或者这条地址是别人的'})
            }
        });
    } else {
        res.json({ok: -1, msg: '您不属于顾客，没有删除地址的权限'})
    }
});

/*修改地址
参数:id,name/phone/addr/isDefault
需要修改的id项，及想要更改的字段
 */
router.post('/alter', (req, res) => {
    if (req.userType === 1) {
        let data = sliceObj(req.body, ['name', 'phone', 'address', 'isDefault']);
        db.Address.update(data, {where: {id: req.body.id, userId: req.userId}}).then(num => {
            if (num[0]) {
                res.json({ok: 1, num: num[0]})
            } else {
                res.json({ok: -1, msg: '修改0条数据'})
            }
        });

    } else {
        res.json({ok: 1, msg: '不属于顾客，无权限修改地址'})
    }
});

/*获取地址列表
 */
router.get('/list', (req, res) => {
    if (req.userType === 1) {
        db.Address.findAll({where: {userId: req.userId}}).then(addressList => {
            res.json({ok: 1, addressList})
        })
    } else {
        res.json({ok: 1, msg: '您非顾客，没有地址列表'})
    }
});

module.exports = router;





