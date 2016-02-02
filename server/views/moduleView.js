/**
 * Created by hk61 on 2016/1/28.
 */

var Branch = require('../models/Branch');
var sequelize = require('../core/db');

var moduleView = module.exports = {

    /*================================ 查询 ====================================*/

    /*
    * 根据id获取对应元素所在的层级
    * @para [String] id 模块id
    * */
    getLayerById: function(id) {

        return Branch.findById(id).then(function(list) {
            var _lft = list.lft;
            var _rgt = list.rgt;

            return Branch.findAndCount({
                where:{
                    lft:{
                        lte:_lft
                    },
                    rgt:{
                        gte:_rgt
                    }
                }
            }).then(function(list) {
                return list;
            });
        });
    },

    /*
    * 获取子孙节点
    * @para [String] id 模块id
    * */
    getChildrenById: function(id) {
        return Branch.findById(id).then(function(list) {
            var _lft = list.lft;
            var _rgt = list.rgt;

            return Branch.findAll({
                where:{
                    lft:{
                        gte:_lft
                    },
                    rgt:{
                        lte:_rgt
                    }
                }
            }).then(function(list) {
                return list;
            });
        });
    },

    /*
    * 获取子节点
    * @para [String] id 模块id
    * */
    getChildById: function(id) {

        return Branch.findAll({
            where: {
                fatherId: id
            }
        }).then(function(list) {
            return list;
        })

    },

    /*
     * 获取叶子节点
     * @para [String] id 模块id
     * */
    getLeafById: function(id) {

        return Branch.findById(id).then(function(list) {
            var query = 'SELECT * FROM "T_ModuleInfo" WHERE "F_MI_Left"="F_MI_Right"-1 AND "F_MI_Left" >= '+ list.lft +' AND "F_MI_Right" <= '+ list.rgt +';';
            return sequelize.query(query).spread(function(results, metaData) {
                return results;
            });
        })

    },

    /*
    * 获取兄弟节点
    * @para [String] id 模块id
    * */
    getSiblingById: function(id) {

        return Branch.findById(id).then(function(list) {
            return Branch.findAll({
                where:{
                    fatherId:list.fatherId
                }
            }).then(function(list) {
                return list;
            });
        })

    },


    /*================================ 插入 ====================================*/
    /*
    * 插入根节点
    * @para [JSON] data 节点属性集
    * */
    insertRoot: function(data) {

        Branch.update({
            lft:sequelize.literal('"F_MI_Left" + 1'),
            rgt:sequelize.literal('"F_MI_Right" + 1')
        },{
            where: {
                lft:{
                    $gte:1
                }
            }
        }).then(function(results){
            return Branch.count()
        }).then(function(num){
            return Branch.create({
                name:data.name,
                id:1000,
                lft:1,
                rgt:(num + 1) * 2
            })
        }).then(function(results){
            Branch.update({fatherId:results.id},{
                where:{
                    lft:2
                }
            })
        })

    },

    /*
     * 插入子节点
     * @para [String] parentId 参考父节点Id
     * @para [JSON] data 节点属性集
     * */
     insertChild: function(parentId, data) {
         var _lft, _rgt;

         Branch.findById(parentId)
             .then(function(result) {
                 _lft = result.rgt;
                 _rgt =  result.rgt + 1;
                 return Branch.create({
                     name: data.name,
                     id: parseInt(Math.random() * 10000), // 随机id
                     fatherId: result.id,
                     lft: _lft,
                     rgt: _rgt
                 })
             })
             .then(function(result) {

                 // 左值更新
                return  Branch.update({
                     lft: sequelize.literal('"F_MI_Left" + 2')
                 },{
                     where:{
                         lft:{
                             $gt: _lft
                         }
                     }
                 });
             })
             .then(function(result){
                 // 右值更新
                 Branch.update({
                     rgt: sequelize.literal('"F_MI_Right" + 2')
                 },{
                     where:{
                         rgt:{
                             $gte: _lft
                         }
                     }
                 });
             })

     },

    /*================================ 删除 ====================================*/
    /*
     * 插入子节点
     * @para [String] id 要删除的节点【其子孙节点也将一并删除】
     * */
    deleteById: function(id) {
        var _lft, _rgt, gap;

        Branch.findById(id)
            .then(function(result) {
                _lft = result.lft;
                _rgt = result.rgt;

                return Branch.destroy({
                    where:{
                        lft:{
                            gte:_lft
                        },
                        rgt:{
                            lte:_rgt
                        }
                    }
                })
            })
            .then(function(){
                gap = _rgt - _lft + 1;
                // 更新左右值
                return  Branch.update({
                    lft: sequelize.literal('"F_MI_Left" -' + gap),
                    rgt: sequelize.literal('"F_MI_Right" -' + gap)
                },{
                    where:{
                        rgt:{
                            $gt: _rgt
                        }
                    }
                });
            })

    },

    /*================================ 移动节点 ====================================*/
    /*
     * 移动节点
     * @para [String] id 要移动的节点id
     * @para [String] desParentId 目标父节点id
     * */
    moveTo: function(id, desParentId) {

        var pre_lft, pre_rgt, des_lft, des_rgt, gap;





    }


};