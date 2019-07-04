var express = require('express');
var router = express.Router();

//根拦截器
router.all('*',(req,res,next)=>{
  next()
});

//获取店铺
router.get('/', (req, res)=>{
  res.send('respond with a resource');
});


//增加店铺
router.post('/',(req,res)=>{
  res.json({
    ok:1
  })
});

//删除店铺
router.delete('/',(req,res)=>{
  res.json({
    ok:1
  })
});


//修改店铺
router.put('/',(req,res)=>{
  res.json({
    ok:1
  })
});


module.exports = router;
