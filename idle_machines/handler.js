'use strict';

const request = require('request');
const Promise = require('bluebird');
const { TELECLAW_API, TELECLAW_ACCESS_TOKEN } = process.env; 

module.exports.clear = (event, context, callback) => {
  function generateJSONAPI(url, filter){
    return url + '&filter=' + JSON.stringify(filter) ;
  }

  function cleanMachine(){
    let filter = {
      where:{
        status: 'open',
        currentUser: {
          neq: null
        }
      }
    }
    var api = generateJSONAPI(`${TELECLAW_API}/api/machines?access_token=${TELECLAW_ACCESS_TOKEN}`,filter);
    request(api, (err, res, body)=>{
      let machines = JSON.parse(body);
      //console.log('machines : ', machines)
      if(machines.length > 0){
        machines.map(machine=>{
          //if machine has not update in last 9 sec, clean it.
          let lastupdate = new Date(machine.lastStatusChanged).getTime()
          if(compareTimeStamp(lastupdate, 9000)){
            nextReservation(machine.id);
          };
        });
      };
    })
  };

  function cleanPlay(){
    let filter = {
      where: {
        status: 'playing'
      }
    }
    var api = generateJSONAPI(`${TELECLAW_API}/api/machines?access_token=${TELECLAW_ACCESS_TOKEN}`,filter);
    request(api, (err, res, body)=>{
      let machines = JSON.parse(body);
      //console.log('machines : ', machines)
      if(machines.length > 0){
        machines.map(machine=>{
            //if the machine has not updated in last 48 sec, clean it.
          let lastupdate = new Date(machine.lastStatusChanged).getTime()
          if(compareTimeStamp(lastupdate, 48000)){
            updateMachine(machine.id).then(res=>{
              nextReservation(machine.id);
              return null
            }).catch(error=>{
              console.log('err in update machine ', error)
            })

          };
        });
      };
    })
  };

  function compareTimeStamp(time, duration){
    let now = new Date().getTime();
    //console.log('compare time now : ', now);
    //console.log('now and last updated time different : ', (now - time));
    if((now - time) > duration){
      return true; //<--- = there is no response from user
    }else{
      return false; //<--- = there is response from user
    }
  };

  //api to find for next reservation
  function nextReservation(machineId){
    request(`${TELECLAW_API}/api/reservations/${machineId}/serverlessWorker?access_token=${TELECLAW_ACCESS_TOKEN}`, (err, res, body)=>{
      console.log(body);
      if(err){
        console.log("err in next reservation");
      }
    })
  };

  //api to update play final result
  function updateMachine(machineId){
    let option = {
      method: 'PATCH',
      url: `${TELECLAW_API}/api/machines/${machineId}?access_token=${TELECLAW_ACCESS_TOKEN}`,
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({ 
        "status": "open" 
      })
    }
    return new Promise((resolve, reject)=>{
      request(option, (err, res, body)=>{
        if(err){ 
          reject(err)
        }
        //console.log('update play body : ', body)
        resolve(body)
      });
    });
  };


  //exec clean machine
  cleanMachine();

  //exec clean play
  cleanPlay();



  // callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  callback(null, { message: 'Invoke success', event });
};
