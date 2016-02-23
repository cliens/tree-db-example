/**
 * Created by hk61 on 2016/1/28.
 */

var sequelize = require('../core/db');
var Branch = require('../models/Branch');
/*var ns = require('continuation-local-storage').createNamespace('dbTree');
 sequelize.cls = ns;*/

var moduleView = module.exports = {

    /*================================ 查询 ====================================*/

    /*
     * 根据id获取对应元素所在的层级
     * @para [String] id 模块id
     * */
    getLayerById: function (id) {

        return Branch.findById(id).then(function (list) {
            var _lft = list.lft;
            var _rgt = list.rgt;

            return Branch.findAndCount({
                where: {
                    lft: {
                        lte: _lft
                    },
                    rgt: {
                        gte: _rgt
                    }
                }
            }).then(function (list) {
                return list;
            });
        });
    },

    /*
     * 获取所有节点
     * */
    getAll: function () {
        return Branch.findAll({
            attributes: {
                exclude: [
                    'lft',
                    'rgt'
                ]
            },
            order: [
                ['F_MI_Left']
            ],
            raw: true
        }).then(function (list) {
            return list;
        });
    },

    /*
     * 获取祖先节点
     * @para [String] id 模块id
     * */
    getAncestorById: function (id) {

        return Branch.findById(id).then(function (list) {
            var _lft = list.lft;
            var _rgt = list.rgt;

            return Branch.findAll({
                where: {
                    lft: {
                        lte: _lft
                    },
                    rgt: {
                        gte: _rgt
                    }
                }
            }).then(function (list) {
                return list;
            });
        });
    },

    /*
     * 获取非父节点下分支的所有节点
     * @para [String] id 模块id
     * */
    getOtherBranchById: function (id) {

        if (!id) return;
        return Branch.findById(id).then(function (list) {
            var _lft = list.lft
                , _rgt = list.rgt;

            return Branch.findAll({
                where: {
                    $not: {
                        lft: {
                            gte: _lft
                        },
                        rgt: {
                            lte: _rgt
                        }
                    }
                },
                attributes: {
                    exclude: [
                        'lft',
                        'rgt'
                    ]
                },
                order: [
                    ['F_MI_Left']
                ]
            })

        })
    },

    /*
     * 获取子孙节点
     * @para [String] id 模块id
     * */
    getChildrenById: function (id) {
        return Branch.findById(id).then(function (list) {
            var _lft = list.lft;
            var _rgt = list.rgt;

            return Branch.findAll({
                where: {
                    lft: {
                        gt: _lft
                    },
                    rgt: {
                        lt: _rgt
                    }
                },
                attributes: {
                    exclude: [
                        'lft',
                        'rgt'
                    ]
                }
            }).then(function (list) {
                return list;
            });
        });
    },

    /*
     * 获取子节点
     * @para [String] id 模块id
     * */
    getChildById: function (id) {

        return Branch.findAll({
            where: {
                fatherId: id
            }
        }).then(function (list) {
            return list;
        })

    },

    /*
     * 获取叶子节点
     * @para [String] id 模块id
     * */
    getLeafById: function (id) {

        return Branch.findById(id).then(function (list) {
            var query = 'SELECT * FROM "T_ModuleInfo" WHERE "F_MI_Left"="F_MI_Right"-1 AND "F_MI_Left" >= '
                + list.lft + ' AND "F_MI_Right" <= ' + list.rgt + ';';

            return sequelize.query(query).spread(function (results, metaData) {
                return results;
            });
        })

    },

    /*
     * 获取兄弟节点
     * @para [String] id 模块id
     * */
    getSiblingById: function (id) {

        return Branch.findById(id).then(function (list) {
            return Branch.findAll({
                where: {
                    fatherId: list.fatherId
                }
            }).then(function (list) {
                return list;
            });
        })

    },

    /*================================ 插入 ====================================*/
    /*
     * 插入根节点
     * @para [JSON] data 节点属性集
     * */
    insertRoot: function (data) {

        return sequelize.transaction().then(function (t) {
            return Branch.update({
                lft: sequelize.literal('"F_MI_Left" + 1'),
                rgt: sequelize.literal('"F_MI_Right" + 1')
            }, {
                where: {
                    lft: {
                        $gte: 1
                    }
                },
                transaction: t
            }).then(function (results) {
                return Branch.count()
            }).then(function (num) {
                return Branch.create({
                    name: data.name,
                    //id: 0,
                    lft: 1,
                    rgt: (num + 1) * 2
                }, {
                    transaction: t
                })
            }).then(function (results) {
                             return Branch.update({fatherId: results.id}, {
                                 where: {
                                     lft: 2
                                 },
                                 transaction: t
                             })
                         })
                         .then(t.commit.bind(t))
                         .catch(t.rollback.bind(t))
        })

    },

    /*
     * 插入子节点
     * @para [String] parentId 参考父节点Id
     * @para [JSON] data 节点属性集
     * @return [Promise] 返回异步对象
     * */
    insertChild: function (parentId, data) {
        var _rgt;

        return sequelize.transaction().then(function (t) {
            return Branch.findById(parentId)
                         .then(function (result) {
                             _rgt = result.rgt;
                         })
                         .then(function () {
                             // 左值更新
                             return Branch.update({
                                 lft: sequelize.literal('"F_MI_Left" + 2')
                             }, {
                                 where: {
                                     lft: {
                                         $gt: _rgt
                                     }
                                 },
                                 transaction: t
                             });
                         })
                         .then(function () {
                             // 右值更新
                             Branch.update({
                                 rgt: sequelize.literal('"F_MI_Right" + 2')
                             }, {
                                 where: {
                                     rgt: {
                                         $gte: _rgt
                                     }
                                 },
                                 transaction: t
                             });
                         })
                         .then(function () {
                             // 插入
                             return Branch.create({
                                 name: data.name,
                                 fatherId: parentId,
                                 lft: _rgt,
                                 rgt: _rgt + 1
                             }, {
                                 transaction: t
                             })
                         })
                         .then(t.commit.bind(t))
                         .catch(t.rollback.bind(t))
        })
    },

    /*================================ 删除 ====================================*/
    /*
     * 删除子节点
     * @para [String] id 要删除的节点【其子孙节点也将一并删除】
     * @return [Promise] 返回异步对象
     * */
    deleteById: function (id) {
        var _lft, _rgt, gap;
        return sequelize.transaction().then(function (t) {
            return Branch.findById(id)
                         .then(function (result) {
                             _lft = result.lft;
                             _rgt = result.rgt;

                             return Branch.destroy({
                                 where: {
                                     lft: {
                                         gte: _lft
                                     },
                                     rgt: {
                                         lte: _rgt
                                     }
                                 },
                                 transaction: t
                             })
                         })
                         .then(function () {
                             gap = _rgt - _lft + 1;
                             // 更新左值
                             return Branch.update({
                                              lft: sequelize.literal('"F_MI_Left" -' + gap)
                                          }, {
                                              where: {
                                                  lft: {
                                                      $gt: _lft
                                                  }
                                              },
                                              transaction: t
                                          })
                                          .then(function () {
                                              // 更新右值
                                              return Branch.update({
                                                  rgt: sequelize.literal('"F_MI_Right" -' + gap)
                                              }, {
                                                  where: {
                                                      rgt: {
                                                          $gt: _rgt
                                                      }
                                                  },
                                                  transaction: t
                                              })
                                          });

                         })
                         .then(t.commit.bind(t))
                         .catch(t.rollback.bind(t))
        })

    },

    /*================================ 修改 ==============================*/
    /*
     * 移动节点
     * @para [String] id 要移动的节点id
     * @para [String] desParentId 目标父节点id
     * @return [Promise] 返回异步对象
     * */
    moveTo: function (id, desParentId) {

        var
            pre_lft     // 所移节点左值
            , pre_rgt   // 所移节点右值
            , des_lft   // 目标父节点左值
            , des_rgt   // 目标父节点右值
            , gap   // 被移动的节点数*2 的值
            , changed;  // 移动后值的变化大小

        // 1.重置fatherId
        return sequelize.transaction().then(function (t) {
            return Branch.update({fatherId: desParentId}, {
                             where: {
                                 id: id
                             },
                             transaction: t
                         })
                         .then(function () {
                             return Branch.findById(id)
                         })
                         .then(function (result) {
                             pre_lft = result.lft;
                             pre_rgt = result.rgt;
                             gap = pre_rgt - pre_lft + 1;
                             return Branch.findById(desParentId)
                         })
                         // 2.更新子孙左值
                         .then(function (result) {
                             des_lft = result.lft;
                             des_rgt = result.rgt;
                             changed = pre_lft - des_rgt;
                             changed = changed < 0 ? changed + gap : changed;
                             return Branch.update({
                                 lft: sequelize.literal('"F_MI_Left" - ' + changed)
                             }, {
                                 where: {
                                     lft: {
                                         $between: [pre_lft, pre_rgt]
                                     }
                                 },
                                 transaction: t
                             })
                         })
                         // 3.更新被影响节点的左值
                         .then(function () {
                             if (changed > 0) {
                                 return Branch.update({
                                     lft: sequelize.literal('"F_MI_Left" + ' + gap)
                                 }, {
                                     where: {
                                         lft: {
                                             $and: [
                                                 {$gt: des_rgt},
                                                 {$lt: pre_lft}
                                             ]
                                         },
                                         rgt: {
                                             $or: [
                                                 {$gt: pre_rgt},
                                                 {$lt: pre_lft}
                                             ]
                                         }
                                     },
                                     transaction: t
                                 })
                             } else {
                                 return Branch.update({
                                     lft: sequelize.literal('"F_MI_Left" - ' + gap)
                                 }, {
                                     where: {
                                         lft: {
                                             $and: [
                                                 {$gt: pre_rgt},
                                                 {$lt: des_rgt}
                                             ]
                                         },
                                         rgt: {
                                             $notBetween: [pre_lft, pre_rgt]
                                         }
                                     },
                                     transaction: t
                                 })
                             }
                         })
                         // 4.更新子节点右值
                         .then(function () {
                             return changed > 0 ?
                                    Branch.update({
                                        rgt: sequelize.literal('"F_MI_Right" - ' + changed)
                                    }, {
                                        where: {
                                            lft: {
                                                $between: [des_rgt, des_rgt + gap - 1]
                                            }
                                        },
                                        transaction: t
                                    })
                                 :
                                    Branch.update({
                                        rgt: sequelize.literal('"F_MI_Right" - ' + changed)
                                    }, {
                                        where: {
                                            lft: {
                                                $between: [des_rgt - gap, des_rgt]
                                            }
                                        },
                                        transaction: t
                                    })
                         })
                         // 5.更新被影响节点的右值
                         .then(function () {
                             return changed > 0 ?
                                    Branch.update({
                                        rgt: sequelize.literal('"F_MI_Right" + ' + gap)
                                    }, {
                                        where: {
                                            rgt: {
                                                $and: [
                                                    {$lt: pre_rgt},
                                                    {$gte: des_rgt}
                                                ]
                                            },
                                            lft: {
                                                $notBetween: [des_rgt, des_rgt + gap - 1]
                                            }
                                        },
                                        transaction: t
                                    })
                                 :
                                    Branch.update({
                                        rgt: sequelize.literal('"F_MI_Right" - ' + gap)
                                    }, {
                                        where: {
                                            rgt: {
                                                $and: [
                                                    {$lt: des_rgt},
                                                    {$gt: pre_rgt}
                                                ]
                                            },
                                            lft: {
                                                $notBetween: [des_rgt - gap, des_rgt]
                                            }
                                        },
                                        transaction: t
                                    })
                         })
                         .then(t.commit.bind(t))
                         .catch(t.rollback.bind(t));
        })

    },
    /*
     * 同层平移
     * @para [String] selfId 要移动的节点ID
     * @para [String] refId 参考节点ID
     * @para [Boolean] isForward true移动到参考节点前，false移动到参考节点之后
     * */
    translation: function (selfId, refId, isForward) {
        isForward = isForward == 'true';

        var selfGap
            , selfLft
            , selfRgt
            , refGap
            , refLft
            , refRgt
            , selfChanged
            , refChanged
            , gap;

        return sequelize.transaction().then(function (t) {
            return Branch.findById(selfId).then(function (self) {
                     selfLft = self.lft;
                     selfRgt = self.rgt;
                     selfGap = selfRgt - selfLft + 1;

                     return Branch.findById(refId)
                 })
                 .then(function (ref) {
                     refLft = ref.lft;
                     refRgt = ref.rgt;
                     refGap = refRgt - refLft + 1;

                     if (selfLft > refLft) {
                         gap = selfLft - refRgt;
                         selfChanged = isForward ? (selfLft - refLft) : (selfLft - refRgt - 1);
                         refChanged = -selfGap;
                     } else {
                         if (isForward) {
                             gap = refLft - selfRgt;
                             selfChanged = refLft - selfRgt - 1;
                             refChanged = 0;
                         } else {
                             gap = refLft - selfRgt - 1;
                             selfChanged = gap + selfGap;
                             refChanged = -selfGap;
                         }

                     }

                     if (selfLft > refLft) {
                         // 更新self节点左值
                         return isForward ?
                             /*=========== 前插 ============*/
                                Branch.update({
                                          lft: sequelize.literal('"F_MI_Left" - ' + selfChanged)
                                      }, {
                                          where: {
                                              rgt: {
                                                  $between: [selfLft, selfRgt]
                                              }
                                          },
                                          transaction: t
                                      })
                                      // 更新ref和gap节点的左值
                                      .then(function () {
                                          return Branch.update({
                                              lft: sequelize.literal('"F_MI_Left" - ' + refChanged)
                                          }, {
                                              where: {
                                                  rgt: {
                                                      $between: [refLft, selfLft]
                                                  }
                                              },
                                              transaction: t
                                          })
                                      })
                                      // 更新self节点的右值
                                      .then(function () {
                                          return Branch.update({
                                              rgt: sequelize.literal('"F_MI_Right" - ' + selfChanged)
                                          }, {
                                              where: {
                                                  lft: {
                                                      $between: [selfLft - selfChanged, selfRgt - selfChanged]
                                                  }
                                              },
                                              transaction: t
                                          })
                                      })
                                      // 更新gap节点的右值
                                      .then(function () {
                                          return Branch.update({
                                              rgt: sequelize.literal('"F_MI_Right" - ' + refChanged)
                                          }, {
                                              where: {
                                                  lft: {
                                                      $between: [refLft - refChanged, refRgt - refChanged + gap - 1]
                                                  }
                                              },
                                              transaction: t
                                          })
                                      })
                             :
                             /*========== 后插 ==========*/
                                Branch.update({
                                          lft: sequelize.literal('"F_MI_Left" - ' + selfChanged)
                                      }, {
                                          where: {
                                              rgt: {
                                                  $between: [selfLft, selfRgt]
                                              }
                                          },
                                          transaction: t
                                      })
                                      // 更新gap节点的左值
                                      .then(function () {
                                          return Branch.update({
                                              lft: sequelize.literal('"F_MI_Left" - ' + refChanged)
                                          }, {
                                              where: {
                                                  rgt: {
                                                      $between: [refRgt + 1, selfLft]
                                                  }
                                              },
                                              transaction: t
                                          })
                                      })
                                      // 更新self节点的右值
                                      .then(function () {
                                          return Branch.update({
                                              rgt: sequelize.literal('"F_MI_Right" - ' + selfChanged)
                                          }, {
                                              where: {
                                                  lft: {
                                                      $between: [selfLft - selfChanged,selfRgt - selfChanged - 1]
                                                  }
                                              },
                                              transaction: t
                                          })
                                      })
                                      // 更新gap节点的右值
                                      .then(function () {
                                          return Branch.update({
                                              rgt: sequelize.literal('"F_MI_Right" - ' + refChanged)
                                          }, {
                                              where: {
                                                  lft: {
                                                      $between: [selfRgt - selfChanged, selfRgt - selfChanged + gap]
                                                  }
                                              },
                                              transaction: t
                                          })
                                      })

                     } else {
                         /*=========== 前插 =============*/
                         // 更新self节点左值
                         return isForward ? Branch.update({
                                                      lft: sequelize.literal('"F_MI_Left" + ' + selfChanged)
                                                  }, {
                                                      where: {
                                                          rgt: {
                                                              $between: [selfLft, selfRgt]
                                                          }
                                                      },
                                                      transaction: t
                                                  })
                                                  // 更新gap节点的左值
                                                  .then(function () {
                                                      return Branch.update({
                                                          lft: sequelize.literal('"F_MI_Left" - ' + selfGap)
                                                      }, {
                                                          where: {
                                                              rgt: {
                                                                  $between: [selfRgt + 1, refLft]
                                                              }
                                                          },
                                                          transaction: t
                                                      })
                                                  })
                                                  // 更新self节点的右值
                                                  .then(function () {
                                                      return Branch.update({
                                                          rgt: sequelize.literal('"F_MI_Right" + ' + selfChanged)
                                                      }, {
                                                          where: {
                                                              lft: {
                                                                  $between: [selfLft + selfChanged,
                                                                      selfRgt + selfChanged]
                                                              }
                                                          },
                                                          transaction: t
                                                      })
                                                  })
                                                  // 更新gap节点的右值
                                                  .then(function () {
                                                      return Branch.update({
                                                          rgt: sequelize.literal('"F_MI_Right" - ' + selfGap)
                                                      }, {
                                                          where: {
                                                              lft: {
                                                                  $between: [selfLft, selfLft + selfChanged - 1]
                                                              }
                                                          },
                                                          transaction: t
                                                      })
                                                  })
                             :
                             /*================ 后插 ====================*/
                                Branch.update({
                                          lft: sequelize.literal('"F_MI_Left" + ' + selfChanged)
                                      }, {
                                          where: {
                                              rgt: {
                                                  $between: [selfLft, selfRgt]
                                              }
                                          },
                                          transaction: t
                                      })
                                      // 更新gap节点的左值
                                      .then(function () {
                                          return Branch.update({
                                              lft: sequelize.literal('"F_MI_Left" - ' + selfGap)
                                          }, {
                                              where: {
                                                  rgt: {
                                                      $between: [selfRgt + 1, refRgt]
                                                  }
                                              },
                                              transaction: t
                                          })
                                      })
                                      // 更新self节点的右值
                                      .then(function () {
                                          return Branch.update({
                                              rgt: sequelize.literal('"F_MI_Right" + ' + selfChanged)
                                          }, {
                                              where: {
                                                  lft: {
                                                      $between: [selfLft + selfChanged, selfRgt + selfChanged]
                                                  }
                                              },
                                              transaction: t
                                          })
                                      })
                                      // 更新gap节点的右值
                                      .then(function () {
                                          return Branch.update({
                                              rgt: sequelize.literal('"F_MI_Right" - ' + selfGap)
                                          }, {
                                              where: {
                                                  lft: {
                                                      $between: [selfLft, selfLft + selfChanged - 1]
                                                  }
                                              },
                                              transaction: t
                                          })
                                      })
                     }

                 })
                 .then(t.commit.bind(t))
                 .catch(t.rollback.bind(t))
        });

    },
    /*
     * 根据id变更节点信息
     * @para [JSON] data 节点属性集
     * @return [Promise] 返回异步对象
     * */
    updateNodeInfo: function (data) {

        if (!data || !data.id) return;

        var id = data.id;

        return Branch.findById(id).then(function (list) {

            var name = data.name || list.name;
            var creatorId = data.creatorId || list.creatorId;

            return Branch.update({
                name: name,
                creatorId: creatorId
            }, {
                where: {
                    id: id
                }
            })
        });

    }
};
