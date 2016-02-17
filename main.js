/**
 * Created by hk61 on 2016/1/22.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var User = require('./server/models/User');
var Branch = require('./server/models/Branch');
var initData = require('./server/data/initData');
var sequelize = require('./server/core/db');
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

// 新增模块
app.post('/addModule', function(req, res, next) {
    var data = req.body;
    Branch.create({
        name: data.name,
        creatorId: data.creatorId,
        fatherId: data.fatherId
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

// 获取所有子孙节点
app.get('/getChildren', function(req, res, next) {
    moduleView.getChildrenById(req.query.id).then(function(result){
        res.json(result);
    });
});
moduleView.getChildrenById('5edbaea0-d555-11e5-ab2d-115a716f3b60').then(function(result){
    console.log(result);
});

// 获取所有子孙节点
app.get('/getAll', function(req, res, next) {
    moduleView.getAll().then(function(result){
        res.json(result);
    });
});

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


// 添加节点
app.post('/addModule', function(req, res, next){

    moduleView.insertRoot(req.body);

});
//moduleView.insertRoot({name:'公司'});
//moduleView.insertChild('24cc3f90-d555-11e5-ba55-61e086be6e7d',{name:'F:'});
//moduleView.insertChild('24cc3f90-d555-11e5-ba55-61e086be6e7d',{name:'C:'});
//moduleView.insertChild('24cc3f90-d555-11e5-ba55-61e086be6e7d',{name:'D:'});
//moduleView.insertChild('24cc3f90-d555-11e5-ba55-61e086be6e7d',{name:'E:'});
//moduleView.insertChild('5edbaea0-d555-11e5-ab2d-115a716f3b60',{name:'Images'});


// 删除节点
//moduleView.deleteById(18);

// 移动节点
//moduleView.moveTo('4b946bb0-d556-11e5-bcf2-ad44904b4f9b', 'ab423ed0-d555-11e5-9ddd-71352fa7adca');
// 端口监听
var server = app.listen(3000, function(){
    console.log('running on port 3000……');
});

/*sequelize.sync({force:true}).done(function(){
    User.create({name:'cliens'});
    var len = initData.length;
/!*    for(var i= 0; i < len;i++){
        Branch.create(initData[i]);
    }*!/
    Branch.create(initData[0]);
});*/
