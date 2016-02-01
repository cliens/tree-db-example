/**
 * Created by hk61 on 2016/1/28.
 */

var Branch = require('../models/Branch');

var moduleView = module.exports = {

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
    * 获取子节点 cliens
    * @para [String] id 模块id
    * */
    getChildById: function(id) {
        return Branch.findById(id).then(function(list) {
            var _lft = list.lft;
            var _rgt = list.rgt;
            console.log('this对象为：',list.get('gap'));
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
     * 获取叶子节点 cliens
     * @para [String] id 模块id
     * */
    getLeafById: function(id) {

        return Branch.findAll({
            where:console.log(this)
        }).then(function(list) {
            return list;
        });

    }

};