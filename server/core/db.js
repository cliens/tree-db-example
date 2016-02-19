/**
 * Created by hk61 on 2016/1/22.
 */

var Sequelize = require('sequelize');


var sequelize = module.exports = new Sequelize('tree-db', 'postgres','123456', {
    host: 'localhost',
    dialect:'postgres',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    typeValidation:true
});




