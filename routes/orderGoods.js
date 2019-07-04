var express = require('express');
var router = express.Router();

//根拦截器
router.all('*',(req,res,next)=>{
  next()
});

//获取订单单一商品
router.get('/', (req, res)=>{
  res.send('respond with a resource');
});


//增加订单商品
router.post('/',(req,res)=>{
  res.json({
    ok:1
  })
});

//删除订单商品
router.delete('/',(req,res)=>{
  res.json({
    ok:1
  })
});


//修改订单商品
router.put('/',(req,res)=>{
  res.json({
    ok:1
  })
});

//获取订单商品列表
router.get('/list',(req,res)=>{
  res.json({ok:1})
});

module.exports = router;
