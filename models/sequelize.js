// import {Sequelize} from "sequelize";

const Sequelize = require('sequelize');

const sequelize = new Sequelize('mysql://root:liu521zhao@127.0.0.1:3306/eleme',{
    pool: {
        max: 3,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    timezone: '+08:00',
});
module.exports=sequelize;
