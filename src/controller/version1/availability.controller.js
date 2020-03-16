// const crypto = require('crypto');
// const jwt = require('jsonwebtoken');
const checkJWT = require('../../utils/check.jwt');
const encryptConfig = require('../../../config/encrypt');
const ObjectId = require('mongodb').ObjectID;

const mongoose = require('mongoose');

const Users = mongoose.model('Users');
const Availability = mongoose.model('Availability');
const validator = require('../../utils/validator');
const Error =  require('../../custom/ErrorHandler');

const AvailabilityController = {

    addAvailability: async (req, res)=>{
        try{
            const { startTime, endTime } = req.body;

            let AddErrors = new Error(400);
            if(!startTime){
               AddErrors.addRequestError('Invalid startTime');
            }if(!endTime){
               AddErrors.addRequestError('Invalid endTime');
            }
            if(AddErrors.isErrors()){
                return res.status(400).json({ success: false, error:AddErrors, message: "Invalid Parameters"});
            }

            let availability = new Availability();
            availability.startTime = parseInt(startTime);
            availability.endTime = parseInt(endTime);
            availability.userId = req.currentUser.userId; //req.body.userId;
            
            let saveAvailability = await availability.save();
            if(saveAvailability){
                console.log('availability saved:',saveAvailability);
                return res.status(200).json({ success: true, response:'Availability saved successfully'});
            }else{
                return res.status(400).json({ success: false, response:'Unable to save Availability'});
            }

        }
        catch(error){
            console.error('error:',error);
            return res.status(500).json({success: false, error: error});
        }
    },

    getAvailability: async (req, res)=>{
        try{

         let result = await  availabilityLogic(req.query.userId);
         console.log(result);
         return res.status(200).json({ success: true, result: result.map((doc)=>({
             startTime: new Date(doc.startTime).toLocaleTimeString(),
             endTime: new Date(doc.endTime).toLocaleTimeString(),
         }))});

        // return res.status(200).render('getAvailability.html',{
        //     result: result.map((doc)=>({
        //         startTime: new Date(doc.startTime).toLocaleTimeString(),
        //         endTime: new Date(doc.endTime).toLocaleTimeString(),
        //     }))
        // })
      

        }catch(error){
            console.error('error:',error);
            return res.status(500).json({success: false, error: error}); 
        }
    }

}

module.exports = AvailabilityController;

async function availabilityLogic(userId){
    let findallAvailability = await Availability.find({ userId: userId}).sort({ startTime: 1}); //ascending order
    console.log('findallAvailability:', findallAvailability);
    let cool = findallAvailability;
    let result = cool;
    let timeFrame = [];
    if(cool.length > 1){
        
       // do{
              timeFrame.push(cool.length);
              result = await Recurssion(cool);
              timeFrame.push(result.length);
       //  }
            //result = await Recurssion(result);
         while(result.length > 1 && (timeFrame[timeFrame.length-1] != timeFrame[timeFrame.length-2])){ //timeFrame[timeFrame.length-1]
            // if( timeFrame[timeFrame.length-1] == result.length){
            //     break;
            //     // result = await Recurssion(result) ;
            //     // timeFrame.push(result.length);
            //     //cool = result
            // }
            // else{
                //break;
                result = await Recurssion(result) ;
                timeFrame.push(result.length);
           // }
         }
    }else{
        result = findallAvailability;
    }
    console.log('result:',result)
    
     return result;
}

async function Recurssion(cool){
    let time=[]
    for(let i =0; i< (cool.length-1); i++){
        if(cool[i].startTime <= cool[i+1].startTime && cool[i].endTime >= cool[i+1].startTime && cool[i].endTime >= cool[i+1].endTime){
            // comming in time frame 
            time.push({ 
                startTime: cool[i].startTime,//new Date(cool[i].startTime).toLocaleTimeString(),
                endTime: cool[i].endTime,//new Date(cool[i+1].endTime).toLocaleTimeString(),
             });
             
             cool.splice(i+1, 1);
             if((cool.length -1) == i+1){
                time.push({
                    startTime: cool[i+1].startTime,//new Date(cool[i].startTime).toLocaleTimeString(),
                    endTime: cool[i+1].endTime,//new Date(cool[i].endTime).toLocaleTimeString(),
                });
                break;
             }
             if(cool.length <= 2){
              if(cool.length < 2 || (cool.length -1 == i)) break;
                time.push({
                    startTime: cool[cool.length-1].startTime,//new Date(cool[i].startTime).toLocaleTimeString(),
                    endTime: cool[cool.length-1].endTime,//new Date(cool[i].endTime).toLocaleTimeString(),
                })
              }
        }else if(cool[i].startTime <= cool[i+1].startTime && cool[i].endTime >= cool[i+1].startTime){
            // comming in time frame 
            time.push({ 
                startTime: cool[i].startTime,//new Date(cool[i].startTime).toLocaleTimeString(),
                endTime: cool[i+1].endTime,//new Date(cool[i+1].endTime).toLocaleTimeString(),
             });
             
             cool.splice(i+1, 1);
             if((cool.length -1) == i+1){
                time.push({
                    startTime: cool[i+1].startTime,//new Date(cool[i].startTime).toLocaleTimeString(),
                    endTime: cool[i+1].endTime,//new Date(cool[i].endTime).toLocaleTimeString(),
                })
                break;
             }
             if(cool.length <= 2){
                if(cool.length < 2 || (cool.length -1 == i)) break;
                time.push({
                    startTime: cool[cool.length-1].startTime,//new Date(cool[i].startTime).toLocaleTimeString(),
                    endTime: cool[cool.length-1].endTime,//new Date(cool[i].endTime).toLocaleTimeString(),
                })
              }
        }else{
          if(cool.length == i+2){
            time.push({
                startTime: cool[i].startTime,//new Date(cool[i].startTime).toLocaleTimeString(),
                endTime: cool[i].endTime,//new Date(cool[i].endTime).toLocaleTimeString(),
            })
            time.push({
                startTime: cool[i+1].startTime,//new Date(cool[i+1].startTime).toLocaleTimeString(),
                endTime: cool[i+1].endTime,//new Date(cool[i+1].endTime).toLocaleTimeString(),
            })
          }else{
            time.push({
                startTime: cool[i].startTime,//new Date(cool[i].startTime).toLocaleTimeString(),
                endTime: cool[i].endTime,//new Date(cool[i].endTime).toLocaleTimeString(),
            })
          }
          
        }
    }
    return time
}