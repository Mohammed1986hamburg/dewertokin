
const { app } = require('./handler');


const AWS = require('aws-sdk');
let awsConfig={
    "region": "eu-central-1",
    "endpoint": "http://dynamodb.eu-central-1.amazonaws.com"
  };
  AWS.config.update(awsConfig);
var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName: 'test',
    Key: {
      'email': "best.pid@gmail.com"
    }
  };

const PORT= process.env.PORT || 4000;

app.listen(PORT, async ()=>{

      const data = await docClient.get(params).promise();

      if(data.Item){console.log("Success found", JSON.stringify(data.Item));}
      else {console.log("not found", data.Item);} 
      console.log(`connected to DynamoDB,  server listening on port ${PORT}!`)

      
})
    


   















