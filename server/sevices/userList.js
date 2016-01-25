/**
 * Created by hk61 on 2016/1/25.
 */


sequelize.sync({force:true}).done(function() {
    User.create({name:'cliens'});
    Model.create({name:'新版软件开发',lft:1,rgt:2});
    creteData();
    function creteData() {
        var dataLen = 5;
        for(var i= 0; i < dataLen;i++){
            Model.create({name:'test' + i,lft:1,rgt:2});
        }
    }
});