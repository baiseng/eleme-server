const express = require('express');
const router = express.Router();
const db = require('../models/table');
const sliceObj = require('../tools/sliceObj');

//根拦截器
router.all('*',(req,res,next)=>{
  if ([1, 3].indexOf(req.userType)>=0){
    next()
  } else {
    res.json({ok:-1,msg:'只有顾客和配送员可以查看订单'})
  }
});

//获取订单
//参数：id
router.get('/', (req, res)=>{
  let {id}=req.query;
  if (id) {
    if (req.userType===1){
      db.Order.findOne({where:{id,ownerId:req.userId}}).then(order=>{
        if (order) {
          res.json({ok:1,order})
        }else {
          res.json({ok:-1,msg:'无此订单'})
        }
      })
    } else {
      db.Order.findOne({where:{id,courierId:req.userId}}).then(order=>{
        if (order) {
          res.json({ok:1,order})
        }else {
          res.json({ok:-1,msg:'无此订单'})
        }
      })
    }
  }else {
    res.json({ok:-1,msg:'查看订单信息必须提供id'})
  }

});


//增加订单
router.post('/',(req,res)=>{
  res.json({
    ok:1
  })
});

//删除订单
router.delete('/',(req,res)=>{
  res.json({
    ok:1
  })
});


//修改订单
router.put('/',(req,res)=>{
  res.json({
    ok:1
  })
});

//获取订单列表
router.get('/list',(req,res)=>{
  res.json({ok:1})
});

module.exports = router;
