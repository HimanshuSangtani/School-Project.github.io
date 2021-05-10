/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


app.factory('serverURLService', function () {
    var serverURLService = {};
    serverURLService.serverURL = 'http://localhost:5000';
    return serverURLService;
});