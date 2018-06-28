'use strict';
let AWS = require('aws-sdk');
AWS.config.update({region: 'ap-southeast-1'})
let dbClient = new AWS.DynamoDB.DocumentClient()

module.exports.vote = (event, context, callback) => {
  //console.log(event);
  const createRes = (res) => {
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*"
      },
      body: JSON.stringify({
        message: res,
      }),
    };
    return response;
  };

  const createVote = (yesOrNo) => {
    let params = {
      TableName: "Votes",
      Key:{
        "YesOrNo" : yesOrNo
      },
      UpdateExpression: "set numberOfVote = numberOfVote + :val",
      ExpressionAttributeValues : {
        ":val" : 1
      },
      ReturnValues: "UPDATED_NEW"
    };

    dbClient.update(params, (err,data)=>{
      if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        callback(null, createRes('fail to vote'));
      } else {
        //console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
        callback(null, createRes('success to vote'));
      };
    });
  }

  let path = event.path
  if(path === '/vote/yes'){
    createVote("voteYes")
  }else if(path === '/vote/no'){
    createVote("voteNo")
  };

};