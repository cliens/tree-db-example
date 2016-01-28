/**
 * Created by hk61 on 2016/1/25.
 */
var Sequelize = require('sequelize');
var sequelize = require('../core/db');

var User = module.exports = sequelize.define('user', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true,
        field: 'PK_UI_Id',
        comment: '主键'
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'F_UI_Name',
        comment: '用户名'
    }
},{
    tableName:'T_UserInfo'
});
