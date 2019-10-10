const express = require('express');
const nem = require("nem-sdk").default;
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// Create Redis Client

let client = redis.createClient();

client.on('connect', function(){
  console.log('Connected to Redis...');
});

// Set Port
const port = 3000;

// Init app
const app = express();

// View Engine
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// methodOverride
app.use(methodOverride('_method'));

// Search Page
app.get('/', function(req, res, next){
  res.render('searchusers');
});


app.post('/', function (req, res, err) {

    var address = req.body.id;
    var timestamp = Math.floor(Date.now() / 1000);

    client.exists(address, function(err, reply) {
    	console.log(reply);
        if (reply === 1) {

            var address = req.body.id;

            //console.log('exists');
            
            client.get(address, function(error, result){
                if (error) throw error;
                    var ts = result;
                    var tiempo_final = timestamp - ts;
                    console.log(tiempo_final);
                    if (tiempo_final  > 300  ){ // THE TIME IS DEFINED EHRE
                        console.log('Ya pasaron 5 minutos')
                        
                        var endpoint = nem.model.objects.create("endpoint")("http://hugetestalice.nem.ninja", nem.model.nodes.defaultPort);
						var common = nem.model.objects.create("common")("YOUR PASSWORD HERE", "YOUR SECRET KEY HERE");
						var amount = 10;
						var message = "From YOUR NAME HERE";

						var address = req.body.id;
                    	
                    	console.log('entrando a nem con address ' +address);
						// codigo para el sdk de nem
	                    let transaction = nem.model.objects.create("transferTransaction")(address, amount, message);
	  					let prepared = nem.model.transactions.prepare("transferTransaction")(common, transaction, nem.model.network.data.testnet.id);
	  
                        

                        nem.model.transactions.send(common, prepared, endpoint).then(function(result) {
                            let code = result.code;
						    let type = result.type;
						    let message = result.message;
						    let transactionHash = result.transactionHash.data;

      console.log("Code: " + code + " type: " + type + " message: " + message + " transactionHash: " + transactionHash);

                            console.log(result.message);
                    
                            client.set(address, timestamp);
                            res.render('details');  
                            
                        }, function(err){
                            var error = err['data']['error'];
                           if(error =='Not Found'){
                            res.render('invalidaddress');   
                           }
                        }) 

                    } else{
                        console.log('No han pasado 5 minutos.')

                        res.render('notyet'); 

                    }
            }) 
        }    else {
                console.log('New address');
                        var endpoint = nem.model.objects.create("endpoint")("http://hugetestalice.nem.ninja", nem.model.nodes.defaultPort);
						var common = nem.model.objects.create("common")("YOUR PASSWORD HERE", "YOUR SECRET KEY HERE");
						var amount = 10;
						var message = "From YOUR NAME HERE";
						var address = req.body.id;
                        console.log('Entrando a nem con address ' + address);
						// codigo para el sdk de nem
	                    let transaction = nem.model.objects.create("transferTransaction")(address, amount, message);
	  					let prepared = nem.model.transactions.prepare("transferTransaction")(common, transaction, nem.model.network.data.testnet.id);
	  
                        
                        nem.model.transactions.send(common, prepared, endpoint).then(function(result) {
                        console.log(result);

                            let code = result.code;
						    let type = result.type;
						    let message = result.message;
						    let transactionHash = result.transactionHash.data;

      					//console.log("Code: " + code + " type: " + type + " message: " + message + " transactionHash: " + transactionHash);

                            console.log(result.message);
                    
                            client.set(address,timestamp);
                            res.render('details');  
                            
                        }, function(err){
                        	console.log(err);
                            var error = err['data']['error'];
                           if(error =='Not Found'){
                            res.render('invalidaddress');   
                           }
                        })                           
        }
     });
    });



app.listen(port, function() {
  console.log(`Example app listening on port `+port);
});


