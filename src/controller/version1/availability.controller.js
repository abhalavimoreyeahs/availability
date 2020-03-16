// const crypto = require('crypto');
// const jwt = require('jsonwebtoken');
const checkJWT = require('../../utils/check.jwt');
const encryptConfig = require('../../../config/encrypt');
const ObjectId = require('mongodb').ObjectID;

const mongoose = require('mongoose');

const Users = mongoose.model('Users');
const Availability = mongoose.model('Availability');
const validator = require('../../utils/validator');
const Error = require('../../custom/ErrorHandler');

const AvailabilityController = {

    addAvailability: async (req, res) => {
        try {
            const { startTime, endTime } = req.body;

            let AddErrors = new Error(400);
            if (!req.currentUser) {
                AddErrors.addRequestError('Invalid user');
            }
            if (!startTime) {
                AddErrors.addRequestError('Invalid startTime');
            }
            if (!endTime) {
                AddErrors.addRequestError('Invalid endTime');
            }
            if (AddErrors.isErrors()) {
                return res.status(400).json({ success: false, error: AddErrors, message: "Invalid Parameters" });
            }

            let availability = new Availability();
            availability.startTime = parseInt(startTime);
            availability.endTime = parseInt(endTime);
            availability.userId = req.currentUser.userId; //req.body.userId;

            let saveAvailability = await availability.save();
            if (saveAvailability) {
                console.log('availability saved:', saveAvailability);
                return res.status(200).json({ success: true, response: 'Availability saved successfully' });
            } else {
                return res.status(400).json({ success: false, response: 'Unable to save Availability' });
            }
        }
        catch (error) {
            console.log('error:', error);
            return res.status(500).json({ success: false, error: error });
        }
    },

    getAvailability: async (req, res) => {
        try {

            let AddErrors = new Error(400);
            if (!req.query.userId) {
                AddErrors.addRequestError('Invalid user');
            }
            if (AddErrors.isErrors()) {
                return res.status(400).json({ success: false, error: AddErrors, message: "Invalid Parameters" });
            }
            if (!req.query.timeOffset) {
                req.query.timeOffset = new Date().getTimezoneOffset();
            }
            let result = await availabilityLogic(req.query.userId);
            console.log(result);

            // day wise availability split 
            let availability = [];  
            result.map((doc) => {  // get availability according to user time zone
                availability.push({
                    startTime: checkJWT.getuserTimeStamp(doc.startTime, req.query.timeOffset),
                    endTime: checkJWT.getuserTimeStamp(doc.endTime, req.query.timeOffset)
                })
            })


            let finalArray = [];
            availability.map((doc) => {  // check availability if it falls under two different date
                if (new Date(doc.startTime).getDate() !== new Date(doc.endTime).getDate()) { 
                    // check if day difference is not more than 24 hours
                    // let dayDiff = parseInt((new Date(availability[i].startTime) - new Date(availability[i].endTime)) / (1000 * 60 * 60 * 24), 10);
                    // split record upto two records 1st for previous date and 2nd for next date
                    finalArray.push({
                        date: new Date(doc.startTime).toLocaleDateString(),
                        startTime: new Date(doc.startTime).toLocaleTimeString(),
                        endTime: new Date(new Date(doc.startTime).setHours(23, 59, 59, 59)).toLocaleTimeString()
                    })
                    finalArray.push({
                        date: new Date(doc.endTime).toLocaleDateString(),
                        startTime: new Date(new Date(doc.endTime).setHours(0, 0, 0, 0)).toLocaleTimeString(),
                        endTime: new Date(doc.endTime).toLocaleTimeString()
                    })
                } else { 
                    finalArray.push({
                        date: new Date(doc.startTime).toLocaleDateString(),
                        startTime: new Date(doc.startTime).toLocaleTimeString(),
                        endTime: new Date(doc.endTime).toLocaleTimeString()
                    })
                }
            })

            return res.status(200).render('getAvailability.html', { result: finalArray });

        } catch (error) {
            console.log('error:', error);
            return res.status(500).json({ success: false, error: error });
        }
    }

}

module.exports = AvailabilityController;

async function availabilityLogic(userId) {
    let findallAvailability = await Availability.find({ userId: userId }).sort({ startTime: 1 }); //sort in ascending order
    console.log('findallAvailability:', findallAvailability);
    // let cool = findallAvailability;
    // let result = cool;
    let result = findallAvailability;
    let timeFrame = [];
    if (findallAvailability.length > 1) {


        timeFrame.push(findallAvailability.length);
        result = await iterations(findallAvailability);
        timeFrame.push(result.length);
         // timeframe = [ 5, 4, 3, 3]
        while (result.length > 1 && (timeFrame[timeFrame.length - 1] != timeFrame[timeFrame.length - 2])) { // while loop for iteration untill availability sorted to last extent

            result = await iterations(result);
            timeFrame.push(result.length);

        }
    } else {
        result = findallAvailability;
    }
    console.log('result:', result)

    return result;
}

async function iterations(data) {
    let time = []

    for (let i = 0; i < (data.length - 1); i++) {
        // 1st case if startTime of availability 2 come under 1st availability time frame(startTime and endTime) and endTime of 2nd availability is less then endTime of 1st availability
        // startTime of 1st availability
        // endTime of 1st availability
        if (data[i].startTime <= data[i + 1].startTime && data[i].endTime >= data[i + 1].startTime && data[i].endTime >= data[i + 1].endTime) {

            // comming in time frame 
            time.push({ startTime: data[i].startTime, endTime: data[i].endTime });

            // remove the next record from array
            data.splice(i + 1, 1);
            if ((data.length - 1) == i + 1) { // if  index come to condition array.length -1 == i + 1 push next data in time array and then break the loop 
                time.push({ startTime: data[i + 1].startTime, endTime: data[i + 1].endTime });
                break;
            }
            if (data.length <= 2) {
                if (data.length < 2 || (data.length - 1 == i)) break; // data.length - 1 == i array in last index
                time.push({ startTime: data[data.length - 1].startTime,  endTime: data[data.length - 1].endTime  })
            }
            // 2nd case if startTime of availability 2 come under 1st availability time frame and endTime of 2nd availability > endTime of 1st availability
            // startTime of 1st availability
            // endTime of 2nd availability
        } else if (data[i].startTime <= data[i + 1].startTime && data[i].endTime >= data[i + 1].startTime) {

            // comming in time frame 
            time.push({ startTime: data[i].startTime, endTime: data[i + 1].endTime });

             // remove the next record from array
            data.splice(i + 1, 1);
            if ((data.length - 1) == i + 1) {
                time.push({ startTime: data[i + 1].startTime, endTime: data[i + 1].endTime })
                break;
            }
            if (data.length <= 2) {
                if (data.length < 2 || (data.length - 1 == i)) break;
                time.push({ startTime: data[data.length - 1].startTime, endTime: data[data.length - 1].endTime })
            }
        } else {
            if (data.length == i + 2) {
                time.push({ startTime: data[i].startTime, endTime: data[i].endTime  })
                time.push({ startTime: data[i + 1].startTime, endTime: data[i + 1].endTime })
            } else {
                time.push({ startTime: data[i].startTime, endTime: data[i].endTime  })
            }

        }
    }
    return time
}