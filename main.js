/**
 * Created by hk61 on 2016/1/22.
 */

var app = require('express')();
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
/*moduleView.getChildrenById(5).then(function(result){
    console.log(result);
});*/

// 获取所有子节点
app.get('/getChild', function(req, res, next) {
    moduleView.getChildById(req.query.id).then(function(result){
        res.json(result);
    });
});
/*moduleView.getChildById(3).then(function(result){
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
//moduleView.insertChild(3,{name:'F:'});


// 删除节点
moduleView.deleteById(18);

// 端口监听
var server = app.listen(3000, function(){
    console.log('running on port 3000……');
});

/*sequelize.sync({force:true}).done(function(){
    User.create({name:'cliens'});
    var len = initData.length;
    for(var i= 0; i < len;i++){
        Branch.create(initData[i]);
    }
});*/
