/**
 * Created by hk61 on 2016/1/22.
 */

var Sequelize = require('sequelize');

var Module = Sequelize.define('tree-db', {

    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true,
        field: 'PK_MI_Id',
        comment: '主键'
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'F_MI_Name',
        comment: '模块名称'
    },
    creatorId: {
        type: Sequelize.UUID,
        references: {
            model: 'T_UserInfo',
            key: 'PK_UI_Id'
        }
    },
    fatherId: {
        type: Sequelize.UUID,
        references: {
            model: 'T_ModuleInfo',
            key: 'PK_MI_Id'
        }
    },
    lft: {
        type: Sequelize.INTEGER,
        field: 'F_MI_Left',
        comment: '树结构辅助计算'
    },
    rgt: {
        type: Sequelize.INTEGER,
        field: 'F_MI_Right',
        comment: '树结构辅助计算'
    }

}, {
    tableName: 'T_ModuleInfo'
});