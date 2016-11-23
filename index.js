var express = require('express');
var fs = require('fs');
var path = require('path');
var http = require('http');
const opn = require('opn');

opn('http://localhost:8088', {app: 'chrome'});

var multer  = require('multer')
var upload = multer({storage: multer.memoryStorage() })
var app = express();


//var router = express.Router();

app.listen('8088', function () {
  console.log('server started');
  console.log('http://localhost:8088');
  preload();
});

opn('http://localhost:8088', {app: 'chrome'});


app.post('/upload',upload.single('filename'),function(req, res,next) {
    console.log(req.file);
    fs.writeFileSync("fff",req.file.buffer);
    res.send("uploaded");
});


var waitinglist = [];
var nowloading = 0;


var resultmap = {};
function preload(){
  var datastr = fs.readFileSync('bill.json', 'utf-8');
  var data = eval("("+datastr+")");
  for(var i=0;i<data.length;i++){
    var code = data[i].code;
    fecth(code);
  }
}

function fecth(orderid){
  
var options = {  
    hostname: 'www.cnpex.com.au',  
    port: 80,  
    path: '/Home/Query',  
    method: 'POST',  
    headers: {  
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'  
    }  
};  
  
var req = http.request(options, function (res) {  
    res.setEncoding('utf8');  
    res.on('data', function (chunk) {  
        //console.log(chunk);
        var allhtml = chunk;
        var hfront = '<div class="wrap pd20">';
        var n = allhtml.indexOf(hfront);
        var s1 = allhtml.substring(n + hfront.length);
        var hback = '<table class="webpost_query_table">';
        var n2 = s1.indexOf(hback);
        var resp = s1.substring(0, n2);
        result = resp.substring(resp.indexOf('<h2>') + 4, resp.indexOf('</h2>'));
        if(result.length>3){
          resultmap[orderid]=result;
        }
    });  
});  
  
req.on('error', function (e) {  
    resultmap[orderid]=orderid + ' 查询失败';
    console.log('problem with request: ' + e.message);  
});  
req.write('OrderId=' + orderid);  
req.end(); 
}

  /*
    superagent.post('http://www.cnpex.com.au/Home/Query')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send('OrderId=' + orderid)
    .end(function (err, sres) {
        var result = 'unknown';
        if(err || !sres.ok){
        console.log(sres);
        result = orderid + ' 查询失败';
      } else {

      }
       resultmap[orderid]=result;
    });
*/





app.get('/getorder', function (req, res) {
  var querydata = req.query;
  var orderid = querydata.d;
  getorderResponse(orderid,res);
});

function getorderResponse(orderid,res){
  if(resultmap[orderid]==undefined){
     setTimeout(function(){
          getorderResponse(orderid,res);
    },2000);
  }else{
    res.send(resultmap[orderid]);
  }
}

app.get('/', function (req, res) {
  var data = fs.readFileSync('index.html', 'utf-8');
  res.send(data);
});

app.get('/bill', function (req, res) {
  var data = fs.readFileSync('bill.json', 'utf-8');
  res.send(data);
});