/**
 * Created by robbynewman on 1/26/16.
 */
/**
 * Created by robbynewman on 1/26/16.
 */


var express = require('express');
var path = require('path');
var router = express.Router();
var passport = require('passport');
var pg = require('pg');

var connectionString = 'postgres://localhost:5432/banking';

router.get('/', function(request, response){
    response.sendFile(path.join(__dirname, '../public/views/index.html'));
});

router.get('/success', function(request, response) {
    if(request.isAuthenticated()) {
        response.sendFile(path.join(__dirname, '../public/views/success.html'));
    } else {
        response.redirect('/');
    }
});

router.get('/fail', function(request, response){
    response.sendFile(path.join(__dirname, '../public/views/fail.html'));
});

router.get('/success', function(request, response){
    console.log('Request user on success route', request.user);
    response.sendFile(path.join(__dirname, '../public/views/success.html'));
});

router.get('/getUser', function(request, response){
    //console.log('Huzzah, a user!', request.user);
    //console.log('Authorized:', request.isAuthenticated());
    response.send(request.user);
});

router.post('/', passport.authenticate('local', {
    successRedirect: '/success',
    failureRedirect: '/fail'
}));


router.post('/payment', function(req,res){
    var id = req.user.id;
    var carDebt = req.user.car_loan - req.body.carPayment;
    var houseDebt = req.user.home_loan - req.body.housePayment;
    var balance = req.user.account_balance - req.body.carPayment - req.body.housePayment;
    var results = {};

    pg.connect(connectionString, function(err, client) {
        if (err) {
            console.log(err);
        }

        var query = client.query("UPDATE user_data SET account_balance=$1, car_loan=$2, home_loan=$3 WHERE id = $4",
            [balance, carDebt, houseDebt,id]);

        query.on('row', function (row) {
            results = row;
        });

        query.on('end', function () {
            client.end();
        });
    });
    res.redirect('/success');

});

module.exports = router;