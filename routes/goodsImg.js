const express = require('express');
const router = express.Router();
const db = require('../models/table');
const sliceObj = require('../tools/sliceObj');
//根拦截器
router.all('*',(req,res,next)=>{
  next()//todo 最好是拦截一下，只允许商家进行增加图片与删除图片；更安全的话，只能操作自己店铺的数据
});

/*获取单个图片
参数：id
 */
router.get('/', (req, res)=>{
  if (req.query.id){
    db.GoodsImg.findOne({where:{id:req.query.id}}).then(goodsImg=>{
      if (goodsImg) {
        res.json({ok:1,goodsImg})
      }else {
        res.json({ok:-1,msg:'没有此id的图片'})
      }
    });
  }else {
    res.json({ok:-1,msg:'缺少图片id'})
  }
});

/*增加图片
参数：img,goodId
 */
router.post('/',(req,res)=>{
  let {img,goodId}=req.body;
  if (img && goodId) {
    let data=sliceObj(req.body,['img','goodId']);
    db.GoodsImg.create(data).then(goodsImg=>{
      if (goodsImg) {
        res.json({ok:1,goodsImg})
      }else {
        res.json({ok:-1,msg:'创建goodsImg失败'})
      }
    });
    db.GoodsImg.create()
  }else {
    res.json({ok:-1,msg:'必须提交img跟goodId'})
  }
});

/*删除图片
参数：id，goodId
 */
router.delete('/',(req,res)=>{
  let {id,goodId}=req.body;
  let data=sliceObj(req.body,['id','goodId']);
  if (id && goodId) {
    db.GoodsImg.destroy({where: data}).then(num=>{
      if (num) {
        res.json({ok:1,msg:'成功删除'+num+'条goodsImg数据'})
      }else {
        res.json({ok:-1,msg:'删除0条goodsImg'})
      }
    })
  }else {
    res.json({ok:-1,msg:'删除图片：缺少id或goodId'})
  }
});

/*修改图片
 */
router.put('/',(req,res)=>{
  res.json({
    ok:-1,msg:'该接口无意义，你可删除图片，然后再创建图片'
  })
});

/*获取图片列表
参数：goodId
 */
router.get('/list',(req,res)=>{
  if (req.query.goodId){
    db.GoodsImg.findAll({where:{goodId:req.query.goodId}}).then(goodsImgList=>{
      res.json({ok:1,goodsImgList})
    })
  } else{
    res.json({ok:-1,msg:'获取图片列表需要goodId'})
  }
});

module.exports = router;
