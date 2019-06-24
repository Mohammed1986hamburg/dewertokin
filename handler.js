const express = require('express');
const serverless = require('serverless-http');
const app = express();
const morgan= require('morgan');
const cookieParser= require('cookie-parser'); 
const AWS = require('aws-sdk');
const fetch = require("node-fetch");

//aws DB Config
let awsConfig={
    "region": "eu-central-1",
    "endpoint": "http://dynamodb.eu-central-1.amazonaws.com"};
AWS.config.update(awsConfig);
var docClient = new AWS.DynamoDB.DocumentClient();

//......all functions................. 
const deviceOn = async(req, res, next)=>{
  // type lamp
  if(req.body.type=="lamp"){

      var params = {
        TableName: 'lamps',
        Key: {
          'deviceId' : 'us001'
        },
        UpdateExpression: "set statusId = :x",
        ConditionExpression: "statusId = :y",
        ExpressionAttributeValues: {
            ":x": Number("1"),
            ":y": Number("0")
        }
      }; 
  
      docClient.update(params, function(err, data) {
        if (err) {
            next(err);
        } else {
           res.status(200).send(`Success, your lamp turned on`);
          }
      });   
  }
  // type tv
  else if (req.body.type=="tv"){
    var params = {
      TableName: 'tvs',
      Key: {
        'deviceId' : 'us001'
      },
      UpdateExpression: "set statusId = :x",
      ConditionExpression: "statusId = :y",
        ExpressionAttributeValues: {
            ":x": Number("1"),
            ":y": Number("0")
        }
    };

    docClient.update(params, function(err, data) {
      if (err) {
          next(err);
      } else {
        res.status(200).send(`Success, your tv turned on`);
        }
    });  
  }
  // type error
  else {
    res.status(201).send(`You have to pass lamp or tv only`)
  }

}

const deviceOff = async(req, res, next)=>{
  // type lamp
  if(req.body.type=="lamp"){

      var params = {
        TableName: 'lamps',
        Key: {
          'deviceId' : 'us001'
        },
        UpdateExpression: "set statusId = :x",
        ConditionExpression: "statusId = :y",
        ExpressionAttributeValues: {
            ":x": Number("0"),
            ":y": Number("1")
        }
      }; 
  
      docClient.update(params, function(err, data) {
        if (err) {
            next(err);
        } else {
           res.status(200).send(`Success, your lamp turned off`);
          }
      });   
  }
  // type tv
  else if (req.body.type=="tv"){
    var params = {
      TableName: 'tvs',
      Key: {
        'deviceId' : 'us001'
      },
      UpdateExpression: "set statusId = :x",
      ConditionExpression: "statusId = :y",
        ExpressionAttributeValues: {
            ":x": Number("0"),
            ":y": Number("1")
        }
    };

    docClient.update(params, function(err, data) {
      if (err) {
          next(err);
      } else {
        res.status(200).send(`Success, your tv turned off`);
        }
    });  
  }
  // type error
  else {
    res.status(201).send(`You have to pass lamp or tv only`)
  }

}

const delelteFurniturePiece = async(req, res, next)=>{
    // type lamp
    if(req.body.type=="lamp"){

        var params = {
          TableName: 'lamps',
          Key: {
            'deviceId' : req.body.deviceId
          },
        }; 
    
        docClient.delete(params, function(err, data) {
          if (err) {
              next(err);
          } else {
             res.status(200).send(`Success, You deleted your lamp`);
            }
        });   
    }
    // type tv
    else if (req.body.type=="tv"){
      var params = {
        TableName: 'tvs',
        Key: {
          'deviceId' : req.body.deviceId
        },
      };
  
      docClient.delete(params, function(err, data) {
        if (err) {
            next(err);
        } else {
          res.status(200).send(`Success, You deleted your tv`);
          }
      });  
    }
    // type error
    else {
      res.status(201).send(`You have to pass lamp or tv only`)
    }

}
        
const getAllFurniturePieces = async (req, res, next) => {
    var piecesArray=[];

    var lampParams = {
        TableName: 'lamps',
        Key: {
          'deviceId': req.body.deviceId
        }
      }; 
    const lampData= await docClient.get(lampParams).promise();
      if(lampData.Item) piecesArray.push(lampData.Item);

    var tvParams = {
      TableName: 'tvs',
      Key: {
        'deviceId': req.body.deviceId
      }
    }; 
    const tvData= await docClient.get(tvParams).promise();
      if(tvData.Item) piecesArray.push(tvData.Item);

      res.status(200).send(piecesArray);
        
}

const newFurniturePiece = async(req, res, next)=>{
    // type lamp
    if(req.body.type=="lamp"){

        var params = {
          TableName: 'lamps',
          Item: {
            'deviceId' : req.body.deviceId,
            'type' : 'lamp',
            'statusId': Number('0')
          },
          ConditionExpression: 'attribute_not_exists(deviceId)'
        }; 
    
        docClient.put(params, function(err, data) {
          if (err) {
              next(err);
          } else {
              res.status(200).send(`Success, You added new lamp`);
            }
        });   
    }
    // type tv
    else if (req.body.type=="tv"){
      var params = {
        TableName: 'tvs',
        Item: {
          'deviceId' : req.body.deviceId,
          'type' : 'tv',
          'statusId': Number('0')
        },
        ConditionExpression: 'attribute_not_exists(deviceId)'
      }; 
  
      docClient.put(params, function(err, data) {
        if (err) {
            next(err);
        } else {
            res.status(200).send(`Success, You added new tv`);
          }
      });  
    }
    // type error
    else {
      res.status(201).send(`You have to add lamp or tv only`)
    }

  }
    
const errorHandler = (err, req, res, next) => {
    err.status = err.status || 500;
    res.status(err.status).json({msg: err.message});
}
//......end functions................. 

//......Alexa............
//...function config
const config = {
  APP_ID : undefined,
  SKILL_NAME : 'okin_home',
  HELP_MESSAGE : ' You can ask me things agin',
  HELP_REPROMPT : 'What can I help you with?',
  STOP_MESSAGE : 'Goodbye!'
}
//......function mainHandler Alexa
const mainHandler = {
  'LaunchRequest': function () {
    this.response.cardRenderer(config.HELP_MESSAGE);
    this.response.speak(config.HELP_MESSAGE);
    this.response.listen(config.HELP_REPROMPT);
    this.emit(':responseReady');
},

'DeviceOn': function(){
  const piece = this.event.request.intent.slots.piece.value;

  if(piece == 'lamp'){
    // the url is from part 1
    fetch('/shops/getByDistancehttps://p7blva2c46.execute-api.us-east-1.amazonaws.com/dev/okinhome/deviceon', {
      method: 'put',
      headers: {'Content-Type':'application/json'}, 
      body: JSON.stringify({
          type:"lamp"
      })
  }).then(res => res.json())
    .then(data => {
      this.response.speak(data);
      this.response.listen(config.HELP_REPROMPT);
      this.emit(':responseReady');
      })    
    .catch(error => console.log(error));  
  }
    else if(piece == 'tv'){
      fetch('/shops/getByDistancehttps://p7blva2c46.execute-api.us-east-1.amazonaws.com/dev/okinhome/deviceon', {
      method: 'put',
      headers: {'Content-Type':'application/json'}, 
      body: JSON.stringify({
          type:"tv"
      })
  }).then(res => res.json())
    .then(data => {
      this.response.speak(data);
      this.response.listen(config.HELP_REPROMPT);
      this.emit(':responseReady');
      })    
    .catch(error => console.log(error)); 
    }

},

'DeviceOff': function(){
  const piece = this.event.request.intent.slots.piece.value;

  if(piece == 'lamp'){
     // the url is from part 1
    fetch('https://p7blva2c46.execute-api.us-east-1.amazonaws.com/dev/okinhome/deviceoff', {
      method: 'put',
      headers: {'Content-Type':'application/json'}, 
      body: JSON.stringify({
          type:"lamp"
      })
  }).then(res => res.json())
    .then(data => {
      this.response.speak(data);
      this.response.listen(config.HELP_REPROMPT);
      this.emit(':responseReady');
      })    
    .catch(error => console.log(error));  
  }
    else if(piece == 'tv'){
      fetch('/shops/getByDistancehttps://p7blva2c46.execute-api.us-east-1.amazonaws.com/dev/okinhome/deviceon', {
      method: 'put',
      headers: {'Content-Type':'application/json'}, 
      body: JSON.stringify({
          type:"tv"
      })
  }).then(res => res.json())
    .then(data => {
      this.response.speak(data);
      this.response.listen(config.HELP_REPROMPT);
      this.emit(':responseReady');
      })    
    .catch(error => console.log(error)); 
    }

},

'StatusList': function(){
     // the url is from part 1
    fetch('https://p7blva2c46.execute-api.us-east-1.amazonaws.com/dev/okinhome/getall', {
      method: 'get',
      headers: {'Content-Type':'application/json'}, 
      body: JSON.stringify({
        deviceId:"us001"
      })
  }).then(res => res.json())
    .then(data => {
      this.response.speak(data);
      this.response.listen(config.HELP_REPROMPT);
      this.emit(':responseReady');
      })    
    .catch(error => console.log(error));  
  

},

'Unhandled': function () {;
  this.response.speak("Sorry I didnt understand");
  this.response.listen(config.HELP_REPROMPT);
  this.emit(':responseReady');
}
};


// alexa execute
const Alexa = require('alexa-sdk');

const myAlexa = (event, context, callback) => {
  console.log("Alexa.main handler");

  var alexa = Alexa.handler(event, context);
  alexa.appId = undefined;

  console.log("Alexa.main: registerHandlers");

  alexa.registerHandlers(defaultHandler,mainHandler);
  
  console.log("Alexa.main: registerHandlers completed");
  alexa.execute();
  console.log("Alexa.main: registerHandlers executed");
};
//.........end Alex......
// app.use
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser()); 

// request routes
app.get('/okinhome/getall',getAllFurniturePieces);
app.post('/okinhome/new',newFurniturePiece);
app.delete('/okinhome/deleteone',delelteFurniturePiece);
app.put('/okinhome/deviceon',deviceOn);
app.put('/okinhome/deviceoff',deviceOff);
app.use(errorHandler);


// export
module.exports = {
    app,
    furnitures:serverless(app), //serverless(app) in order to run Express app in the Serverless Framework
    myAlexa,
};