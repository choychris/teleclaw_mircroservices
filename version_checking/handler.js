'use strict';

const request = require('request');
const Promise = require('bluebird');
const response = require('./utils/response');
const { GITLAB_TOKEN } = process.env; 

function requestToGitlab(){
  let gitLabUrl = 'https://gitlab.com/api/v4/projects/4636598/repository/tags';
  let options = {
    url: gitLabUrl,
    headers: {
      "Private-Token": GITLAB_TOKEN
    }
  };
  return new Promise((resolve, reject)=>{
    request(options, (err, res, body)=>{
      if(err){
        reject(err)
      }
      let tagArray = JSON.parse(body);
      resolve(tagArray);
    })
  })
}

module.exports.releaseStatus = (event, context, callback) => {

  //console.log('body data', event.body);
  let { version, os } = event.body;
  //let data = JSON.parse(event.body);
  //let { version, os } = data;
  let tagName = `${version}-${os}`;
  let responseObj = {};

  requestToGitlab()
    .then(tagArray=>{
      for(let i=0; i<tagArray.length; i++){
        if(tagArray[i].name === tagName){
          responseObj.releaseStatus = tagArray[i].release.description;
          callback(null, response.success(responseObj));
          break;
        }
      }
      return Promise.all(tagArray)
    }).then(()=>{
      if(responseObj.releaseStatus === undefined){
        callback(null, response.success({"message": "version_not_found"}));
      }
    }).catch(error=>{
      console.log(error)
      callback(null, response.failure(error));
    });
  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  //callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};


// Check user's current app version if its latest
module.exports.versionCheck = (event, context, callback) => {

  //console.log('body data', event.body);
  //let { version, os } = event.body;
  let data = JSON.parse(event.body);
  let { version, os } = data;
  let tagName = `${version}-${os}`;
  let responseObj = {};

  requestToGitlab()
    .then(tagArray=>{
      return generateSeparateList(tagArray);
    }).then(latestVersion=>{
      let versionName = latestVersion.name.split("-")[0];
      responseObj.latest = (versionName == version);
      callback(null, response.success(responseObj));
    }).catch(error=>{
      console.log(error)
      callback(null, response.failure(error));
    });

  function generateSeparateList(tagArray){
    return new Promise((resolve, reject)=>{
      let osVersion = tagArray.filter(function(tag){
        let splitTag =  tag.name.split('-');
        return splitTag[1] === os;
      })

      let combineVersion = tagArray.filter(function(tag){
        let splitTag =  tag.name.split('-');
        return splitTag[1] === undefined;
      })
      resolve(whichOS(osVersion[0], combineVersion[0]))
    })
  }

  function whichOS(specifcOS, combinedOS){
    if(!specifcOS){
      return combinedOS;
    } else if (specifcOS.commit.created_at > combinedOS.commit.created_at){
      return specifcOS;
    } else {
      return combinedOS;
    }
  }

};





