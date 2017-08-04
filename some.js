//------------Importing Modules------------
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

//------------Credentials------------
var cred = initDBConnection();
var uname = "121ed65d-c858-4398-aae1-46ee4412c6ca-bluemix";
var pwd = "42794d65ed772dffb67d878bc16737d5736b1b83f907184ec04913cc24dc7429";
var cloudant = Cloudant({account:uname , password:pwd});

//------------Update----------------
app.post('/Update', function(req, res){  
    
    res.sendFile(path.join(__dirname+'/Public/Update.html'));
      
});

//-----------Delete------------
app.post('/Delete', function(req, res){  
    
    res.sendFile(path.join(__dirname+'/Public/Delete.html'));
      
});

//--------------Successful Update---------------
app.post('/UpdateSuccess', function(req, res){
    
    var a, id, fn1, ln1, newfn1, newln1;
    id = req.body.docid;
    fn1 = req.body.fn1;
    ln1 = req.body.ln1;
    
    
    a = cloudant.db.use('testdb');
		a.get(id, function(err, data) {
			if (err) {
				res.json({err:err});
				return;
			}
            console.log(JSON.stringify(data))
            var doc = {    
                           "_id" : data._id,
                           "_rev": data._rev,
                           "old_doc":data.new_doc,
                           "new_doc": {
                               "Name":{
                                   "First Name":fn1,
                                   "Last Name":ln1
                               }
                           }
                           
                      }
            
            a.insert(doc, function(err, data) {
				if (err) {
					res.json({err:err});
					return;
				}
	
				//res.json(doc);
			});
            
        res.send("<br><br><br><center><br>First Name: "+"<b>"+fn1+"</b>"+"<br><i>and</i><br> Last Name: "+"<b>"+ln1+"</b></center>")
        res.end()
    });   
});

//-----------DB Deletion-------------
app.post('/DBDeleted', function(req, res){
    
    var a, dbname;
    
    dbname = req.body.del_db;
    a = cloudant.db.use('_all_dbs');
    
    if(dbname != ""){
        
        cloudant.db.destroy(dbname, function(err, data) {
		if (err) {
			res.json({err:err});
			return;
		}		
		//res.json({data:data});
	});
        
    res.send("<center><br><br><br>DB:<i><b> " + dbname + "</b></i>  deleted Successfully!</center>");
}
    res.end();
    
});

//-----------Doc Deletion-----------
app.post('/DocDeleted', function(req, res){
    
    var a, id;
    id = req.body.del_ID;   
    
    a = cloudant.db.use('testdb');
      if(id != ""){
		a.get(id, function(err, data) {
			if (err) {
				res.json({err:err});
				return;
			}
			a.destroy(data._id, data._rev, function(err, data) {
				if (err) {
					res.json({err:err});
					return;
				}
			});
    }); 
          
    res.send("<center><br><br><br>Document:<i><b> " + id + "</b></i>  deleted Successfully!</center>");
  }
    res.end()
});

//------------Search By ID--------------
//app.post('/AnotherURL', function(req, res){
//   
//    
//    var a, id;
//    id = req.body.idsearch;
//    
//    a = cloudant.db.use('testdb');
//    
//    if (id != "") {
//		a.get(id, function(err, data) {
//			if (err) {
//				res.json({err:err});
//				return;
//			}
//            
//            //res.json({data:data});
//            
//                                                    
////          var output = {First_Name : data.jayson.Name["First name"], Last_Name : data.jayson.Name["Last name"]};
//            var n1 = data.jayson.Name["First name"];
//            var n2 = data.jayson.Name["Last name"];
//            res.send("<center>First Name: <b><i>" + n1 + "</i></b><br><br>Last Name: <b><i>" + n2 + "</i></b></center>");
//            
//    });
//			
//            
////            res.send("<center>Name: "+a.jayson["First name"]+" and Last Name: "+a.jayson["Last Name"]+"</center>")
//            
//            //var jayson = JSON.parse(data);
//            //res.send(jayson.jayson.Name["First name"]+ " " +jayson.jayson.Name["Last name"])
////            for(var d in data){
////                  res += JSON.parse(d);              
////            }
////            res.send("JSON parsed: "+res);
////            
//            
//            
//        
//	} else {
//		res.json({err:"Please specify an id"});
//	}
//    
//});


//------------Store Names--------------
app.post('/NameStored', function(req, res){
    
    var a, fn, ln;
    //console.log(req.body)
  
    fn = req.body.fn;
    ln = req.body.ln;
    
    
    var new_doc = {     
            "Name": { 
                      "First name": fn,
                      "Last name": ln
                    }
    }

//cloudant.db.destroy('testdb', function() {
//cloudant.db.create('testdb', function() {
    a = cloudant.db.use('testdb');
  	a.insert({new_doc},
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

//---------Local Port-------------
//app.listen(8081);

//-----------File Path----------
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname+'/Public/AppSearch.html'));
});


//app.get('/OneMoreURL', function(req, res) {
//    res.sendFile(path.join(__dirname+'/Public/Update.html'));
//});


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