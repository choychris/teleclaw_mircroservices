'use strict';

const request = require('request');
const Promise = require('bluebird');
const { TELECLAW_API, TELECLAW_ACCESS_TOKEN, GITLAB_TOKEN } = process.env; 

module.exports.checkVersion = (event, context, callback) => {

  let gitLabUrl = 'https://gitlab.com/api/v4/projects/4636598/repository/tags';
  let options = {
    url: gitLabUrl,
    headers: {
      "Private-Token": GITLAB_TOKEN
    }
  }

  request(options, (err, res, body)=>{
    if(err){
      callback(err);
    }
    let tagArray = JSON.parse(body);
    callback(null, tagArray);
  })

  

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
