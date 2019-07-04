var express = require('express');
var router = express.Router();

//根拦截器
router.all('*',(req,res,next)=>{
  next()
});

//获取单一分类
//参数：id
router.get('/', (req, res)=>{
  if (req.query.id) {
    db.GoodsType.findById(req.query.id).then(goodsType=>{
      if (goodsType) {
        res.json({ok:1,goodsType})
      }else {
        res.json({ok:-1,msg:'无此id的GoodsType信息'})
      }
    })
  }else {
    res.json({ok:-1,msg:'查询单个goodsType时，缺少id'})
  }
});

//增加分类
router.post('/',(req,res)=>{
  res.json({
    ok:1,msg:'此接口不对外开放，仅运维人员可以添加'
  })
});

//删除分类
router.delete('/',(req,res)=>{
  res.json({
    ok:1,msg:'此接口不对外开放'
  })
});

//修改分类
router.put('/',(req,res)=>{
  res.json({
    ok:1,msg:'此接口不对外开放'
  })
});

//获取分类列表
router.get('/list',(req,res)=>{
  db.goodsType.findAll().then(goodsTypeList=>{
    res.json({ok:1,goodsTypeList})
  })
});

module.exports = router;
