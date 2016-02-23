/**
 * Created by hk61 on 2016/1/22.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var User = require('./server/models/User');
var initData = require('./server/data/initData');
var moduleView = require('./server/views/moduleView');

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/node_modules'));

// 默认主页
app.get('/',function(req, res) {
    res.render('index')
});


// 获取指定用户
app.get('/getUser', function(req, res) {
    User.findAll().then(function(dbUser){
        res.send(dbUser);
    });
});

// 新增用户
app.post('/addUser', function(req, res, next) {
    User.create({
        name:req.body.name
    }).then(function() {
        res.render('index',{status:'添加成功!'})
    }).error(function(){
        res.render('index',{status:'添加失败!'})
    })
});


// 根据id获取层级
app.get('/getLayer', function(req, res, next) {
    moduleView.getLayerById(req.query.id).then(function(result){
        res.json({layer:result.count});
    });
});


// 获取所有节点
app.get('/getAll', function(req, res, next) {
    moduleView.getAll().then(function(result){
        res.json(result);
    });
});


// 获取所有子孙节点
app.get('/getChildren', function(req, res, next) {
    moduleView.getChildrenById(req.query.id).then(function(result){
        res.json(result);
    });
});
/*moduleView.getChildrenById('ef32a620-d5e1-11e5-a0a7-91805fbb8df5').then(function(result){
    console.log(result);
});*/

// 获取所有子节点
app.get('/getChild', function(req, res, next) {
    moduleView.getChildById(req.query.id).then(function(result){
        res.json(result);
    });
});
/*moduleView.getChildById(2).then(function(result){
    console.log(result);
});*/


// 获取叶子节点
app.get('/getLeaf', function(req, res, next) {
    moduleView.getLeafById(req.query.id).then(function(result){
        res.json(result);
    });
});
/*moduleView.getLeafById(4).then(function(result){
   console.log(result);
});*/


// 获取同级节点
app.get('/getSibling', function(req, res, next) {
    moduleView.getSiblingById(req.query.id).then(function(result){
        res.json(result);
    });
});
/*moduleView.getSiblingById(5).then(function(result){
    console.log(result);
});*/


// 获取非当前节点父节点下的节点，用于移动节点
app.get('/getOtherBranchById', function(req, res, next) {
    moduleView.getOtherBranchById(req.query.id).then(function(result){
        res.json(result);
    });
});


// 添加节点
app.post('/addModule', function(req, res, next){
    var data = req.body;
    if(!!data.fatherId){
        moduleView.insertChild(data.fatherId,{name:data.name}).then(function() {
            res.send({status:'ok'});
        });
    }else{
        var hasNode;
        moduleView.getAll().then(function(result) {
            hasNode = result.length > 0;
            if(!hasNode){
                moduleView.insertRoot({name:data.name}).then(function() {
                    res.send({status:'ok'});
                });
            }else{
                res.status(400).send('Error:A fatherId is must!');
            }
        }) ;
    }
});
//moduleView.insertChild('38a55ae0-d557-11e5-a270-a3aedd6430b8',{name:'F:'});
//moduleView.insertRoot({name:'公司'});


// 更改节点信息
app.post('/updateNode', function(req, res, next){
    var data = req.body;
    moduleView.updateNodeInfo(data).then(function(){
        res.send({status:'ok'});
    });
});

// 移动节点
app.get('/moveNode', function(req, res, next){
    moduleView.moveTo(req.query.id, req.query.newParentId ).then(function() {
        res.send({status:'ok'});
    });
});
//moduleView.moveTo('81c768d1-d5e3-11e5-9006-41570f1ba434', 'dd00c040-d5e1-11e5-b366-b1e66d7850e6');

// 同层平移
app.get('/translation', function(req, res, next){
    moduleView.translation(req.query.id, req.query.refId, req.query.forward).then(function() {
        res.send({status:'ok'});
    });
});
/*moduleView.translation('75f685e0-d9d5-11e5-81ff-415dcd7be236', '7b762570-d9d5-11e5-81ff-415dcd7be236',false).then(function() {
    console.log('成功！');
});*/

// 删除节点
app.get('/deleteById', function(req, res, next){
    moduleView.deleteById(req.query.id).then(function() {
        res.send({status:'ok'});
    });
});
//moduleView.deleteById('17825fd1-d5e7-11e5-a96a-2be7074c0884');


// 端口监听
var server = app.listen(3000, function(){
    console.log('running on port 3000……');
});


// 是否强制刷新数据库
/*var sequelize = require('./server/core/db');
var Branch = require('./server/models/Branch');
sequelize.sync({force:true}).done(function(){
    User.create({name:'cliens'});
    var len = initData.length;
/!*    for(var i= 0; i < len;i++){
        Branch.create(initData[i]);
    }*!/
    Branch.create(initData[0]);
});*/
