var express = require('express');
var app = express();
var path = require("path");
var dotenv = require('dotenv');
var fs = require('fs');
//require('dotenv').load();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))


//----------CloudFoundary Runtime Modules----------
var Cloudant = require('cloudant');
var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv(); 


//----------Authenticating---------------
function getDBCredentialsUrl(jsonData) {
    var vcapServices = JSON.parse(jsonData);
    for (var vcapService in vcapServices) {
        if (vcapService.match(/cloudant/i)) {
            return vcapServices[vcapService][0].credentials;
        }
    }
}
var dbCredentials;
function initDBConnection() {
    if (process.env.VCAP_SERVICES) {
        dbCredentials = getDBCredentialsUrl(process.env.VCAP_SERVICES);
        return dbCredentials;
    } else { 
        dbCredentials = getDBCredentialsUrl(fs.readFileSync("myJASON.json", "utf-8")); 
        return dbCredentials;
    }
};

var cred = initDBConnection();
var uname = cred.username;
var pwd = cred.password;
var cloudant = Cloudant({account:uname , password:pwd});


app.post('/AnotherURL', function(req, res){
   
    var a, id, res;
    id = req.body.idsearch;
    
    a = cloudant.db.use('testdb');
    
    if (id != "") {
		a.get(id, function(err, data) {
			if (err) {
				res.json({err:err});
				return;
			}
//            var output = {First_Name : data.jayson.Name["First name"], Last_Name : data.jayson.Name["Last name"]};
            var n1 = data.jayson.Name["First name"];
            var n2 = data.jayson.Name["Last name"];
            res.send("<center><marquee>First Name: <b><i>" + n1 + "</i><b><br><br>Last Name: <b><i>" + n2 + "</i><b></marqee></center>");
			//res.json({data:data});
            
//            res.send("<center>Name: "+a.jayson["First name"]+" and Last Name: "+a.jayson["Last Name"]+"</center>")
            
            //var jayson = JSON.parse(data);
            //res.send(jayson.jayson.Name["First name"]+ " " +jayson.jayson.Name["Last name"])
//            for(var d in data){
//                  res += JSON.parse(d);              
//            }
//            res.send("JSON parsed: "+res);
//            
        });
	} else {
		res.json({err:"Please specify an id"});
	}
    
});

app.get('/SomeURL', function(req, res){
    
    var a, fn, ln;
    //console.log(req.body)
  
    fn = req.body.fn;
    ln = req.body.ln;
    
    
    var jayson = {     
            "Name": { 
                      "First name": fn,
                      "Last name": ln
                    }
    }

//cloudant.db.destroy('testdb', function() {
//cloudant.db.create('testdb', function() {
    a = cloudant.db.use('testdb');
  	a.insert({jayson},
	 function(err, body) {
	    	if(err)
	    			return console.log(err);
	 });
//});    
//});    
    res.send("<br><br><center><br>First Name: "+"<b>"+fn+"</b>"+"<br><i>and</i><br> Last Name: "+"<b>"+ln+"</b></center>")
    res.end()
});



//------------Listen to port--------------
app.listen(appEnv.port, '0.0.0.0', function() { 
    console.log("server starting on " + appEnv.url);
});


//-----------File Path----------
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname+'/AppSearch.html'));
});


//-----------Creating and inserting into DB-------------
//cloudant.db.destroy('a', function(err) {
//
//  cloudant.db.create('a', function() {
//      
//    var a = cloudant.db.use('a')
//
//    a.insert({ some: "aaaaa" }, 'mango', function(err, body, header) {
//      if (err) {
//        return console.log('[a.insert] ', err.message);
//      }
//    });
//  });
//});



//----------Cloudant Credentials-------------
//var uname = '121ed65d-c858-4398-aae1-46ee4412c6ca-bluemix';
//var pwd = '42794d65ed772dffb67d878bc16737d5736b1b83f907184ec04913cc24dc7429';
//var uname = process.env.cloudant_username;
//var pwd = process.env.cloudant_password;
//var cloudant = Cloudant({account:uname , password:pwd});



