/**
 * Created by hk61 on 2016/1/22.
 */

var app = require('express')();
var bodyParser = require('body-parser');
var User = require('./server/models/User');
var Module = require('./server/models/module');

app.get('/getUser', function(req, res) {

    User.findAll().then(function(dbUser){
        res.send(dbUser);
    });


});

app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/',function(req, res) {
    res.render('index')
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
    Module.create({
        name: data.name,
        creatorId: data.creatorId,
        fatherId: data.fatherId
    }).then(function() {
        res.render('index',{status:'添加成功!'})
    }).error(function(){
        res.render('index',{status:'添加失败!'})
    })

});

var server = app.listen(3000, function(){
    console.log('running on port 3000……');
});