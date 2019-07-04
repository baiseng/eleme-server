const sequelize=require('./sequelize');
const Sequelize=require('sequelize');
const db=require('./table');




//**************************测试数据库连接*****************************

// sequelize
//     .authenticate()
//     .then(() => {
//         console.log('连接数据库成功');
//         sequelize.close().then(()=>{console.log('关闭数据库链接')})
//     })
//     .catch(err => {
//         console.error('无法连接数据库:', err);
//     });


//**************************测试创建数据表**********************************

sequelize.sync().then(()=>{
   console.log('数据表创建成功')
});


//**************************测试插入数据**********************************

// User.create({
//         name:'张三',
//         pass: '123456'
// }).then((zhangsan)=>{
//     console.log('创建张三成功:',zhangsan)
// });

//**************************测试修改数据**********************************

// User.update({
//     name:'张三三'
// },{
//     where:{name:'张三'}
// }).then((num)=>{
//     console.log('修改张三成功',num)
// });

//**************************测试删除数据**********************************

// User.destroy({
//     where:{name:'张三'}
// }).then((num)=>{
//     console.log('删除张三成功','删除'+num+'条数据')
// });

//**************************测试查询数据**********************************

// User.findAll().then((users)=>{
//     console.log('查询成功',users)
// });



