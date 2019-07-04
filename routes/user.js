const express = require('express');
const router = express.Router();
const db = require('../models/table');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const jwt = require('../tools/jwt');
const sliceObj = require('../tools/sliceObj');


/*根拦截器
 */
router.all('*', (req, res, next) => {
    next()
});

/*获取用户
通过id或者phone得到唯一用户
 */
router.get('/', (req, res) => {
    let {id, phone} = req.query;
    let data = sliceObj(req.query, ['id', 'phone']);
    if (id || phone) {
        db.User.findOne({
            attributes: {exclude: ['pass', 'token']},
            where: data
        }).then(user => {
            if (user) {
                res.json({ok: 1, user})
            } else {
                res.json({ok: -1, msg: 'id或phone不正确'})
            }
        })
    } else {
        res.json({ok: -1, msg: '必须提交用户id或手机号'})
    }
});
/*获取我的信息
 */
router.get('/my',(req,res)=>{
   db.User.findOne({where:{id:req.userId}}).then(user=>{
       if (user) {
           res.json({ok:1,user})
       }else {
           res.json({ok:-1,msg:'没有找到，你的id有点问题'})
       }
   })
});

/*注册用户
参数：phone,pass[,type]
 */
router.post('/', (req, res) => {
    let {phone, pass, type} = req.body;
    if (phone && pass) {
        db.User.findOne({where: {phone}}).then(user1 => {
            if (user1) {
                res.json({ok: -1, msg: '该手机号已被注册'})
            } else {
                if (!(type / 1 === 1 || type / 1 === 2 || type / 1 === 3)) {
                    type = 1
                }
                db.User.create({phone, pass, type: type ? type / 1 : 1}).then(user2 => {
                    let str = '创建用户失败';
                    if (user2 && user2.type) {
                        type = user2.type;
                        switch (type) {
                            case 1:
                                str = '创建普通用户成功';
                                break;
                            case 2:
                                str = '创建商家成功';
                                break;
                            case 3:
                                str = '创建配送员成功';
                                break;
                            default:
                                break;
                        }
                        res.json({ok: 1, msg: str})
                    } else {
                        res.json({ok: -1, msg: str})
                    }

                })
            }
        })
    } else {
        res.json({ok: -1, msg: 'phone与pass不能为空'})
    }
});

/*修改用户
    只能修改：手机号，密码，别名，年龄，性别
    修改手机号与密码后返回2
    修改普通字段返回1
    {alias:'小皮蛋',age:21}
 */
router.post('/alter', (req, res) => {
    let data = sliceObj(req.body, ['phone', 'pass', 'alias', 'age', 'sex']);
    if (!data.sex || ['男', '女', '未知'].indexOf(data.sex) >= 0) {
        if (data.phone) {
            db.User.findOne({where: {phone: data.phone}}).then(user=>{
                if (user) {
                    res.json({ok:-1,msg:'此手机号已被占用'})
                }else {
                    db.User.update(data, {where: {id: req.userId}}).then(num => {
                        if (num[0]) {
                            if (data.phone || data.pass) {                 //判断是否为修改手机号与密码，如果是，退出登录
                                res.json({ok: 2, num: num[0], msg: '修改成功，此次修改包含手机号或密码,请将token清空'})
                            } else {
                                res.json({ok: 1, num: num[0], msg: '修改普通字段成功'})
                            }
                        } else {
                            res.json({
                                ok: -1, msg: '没有数据更改'
                            })
                        }
                    });
                }
            })
        }else{
            db.User.update(data, {where: {id: req.userId}}).then(num => {
                if (num[0]) {
                    if (data.phone || data.pass) {                 //判断是否为修改手机号与密码，如果是，退出登录
                        res.json({ok: 2, num: num[0], msg: '修改成功，此次修改包含手机号或密码,请将token清空'})
                    } else {
                        res.json({ok: 1, num: num[0], msg: '修改普通字段成功'})
                    }
                } else {
                    res.json({
                        ok: -1, msg: '没有数据更改'
                    })
                }
            });
        }

    } else {
        res.json({ok: -1, msg: '性别只能是男、女、未知'})
    }
});

/*登录账户
需要phone，pass，type
 */
router.post('/login', (req, res) => {
    let {phone, pass, type} = req.body;
    if (phone && pass) {
        db.User.findOne({where: {phone, pass}}).then((user => {
            if (user) {
                if (user.type === type / 1) {
                    res.json({ok: 1, token: jwt.encode({phone, id: user.id, type: user.type})})
                } else {
                    res.json({ok: -1, msg: '用户类型不匹配'})
                }
            } else {
                res.json({ok: -1, msg: '账号密码错误'})
            }
        }))
    } else {
        res.json({ok: -1, msg: 'phone和pass不能为空'})
    }
});

/*退出登录
 */
router.post('/quit', (req, res) => {
    res.json({ok: -1, msg: '老弟，退出不归我管，token在你手中，把它清了就好'})
});

/*删除用户
 */
router.delete('/', (req, res) => {
    res.json({
        ok: -1,
        msg: '删除用户危险操作暂未开发'
    })
});

module.exports = router;

