const encryptConfig = require('../../config/encrypt');

// Libraries
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Mongoose
const mongoose = require('mongoose');

const Users = mongoose.model('Users');

class checkJWT {
    decryptApiKey = async (req, res, next) => {
        try {
            const { authorization } = req.headers;
            console.log(authorization);
            if (!authorization || authorization === 'null') {
                req.currentUser = null;
                return next();
            }

            const decodedKey = await jwt.verify(authorization, encryptConfig.secret);
            if (typeof decodedKey === 'undefined' || typeof decodedKey.userId === 'undefined') {
                req.currentUser = null;
                return next();
            }

            const { userId } = decodedKey; // changing userId to _id
            const user = await Users.findOne({
                _id: userId // changing userId to _id
            });

            if (!user || !user._id) {
                req.currentUser = null;
                return next();
            }

            req.currentUser = user;

            return next();
        } catch (e) {
            console.error('decrypt API e:', e);
            req.currentUser = null;
            return next();
        }
    };

    makeSalt = function makeSalt() {
        return Math.round((new Date().valueOf() * Math.random())) + ''; // eslint-disable-line
    };

    saltPassword = (password) => {
        if (!password) {
            return {
                encrypt: '',
                salt: '',
            };
        }

        const salt = tools.makeSalt();

        const encrypted = crypto
            .createHmac('sha1', salt)
            .update(password)
            .digest('hex');

        return { encrypted, salt };
    };

    decryptPassword = (password, salt) => {
        if (!password || !salt) {
            return false;
        }

        const decrypted = crypto
            .createHmac('sha1', salt)
            .update(password)
            .digest('hex');

        return decrypted;
    };

    getSystemTimezoneOffset = () => {
        let timezoneOffset = 0;
        const tmpDate = new Date();
        const date = new Date(Date.UTC(tmpDate.getUTCFullYear(), tmpDate.getUTCMonth(), tmpDate.getUTCDate(), tmpDate.getUTCHours(), tmpDate.getUTCMinutes(), tmpDate.getUTCSeconds()));
        const offset = date.getTimezoneOffset();
        if (offset > 0) {
            timezoneOffset = ((offset - 1) * 60000);
        } else {
            timezoneOffset = (offset * 60000);
        }
        return timezoneOffset;
    };

    userTimeStamp = (userTimezoneOffset) => {
        let servertimeoffset = new Date().getTimezoneOffset(); // ser offset
        var utc = Date.now() + (servertimeoffset * 60000); // 300 offset
        return (utc - ((60 * 1000) * parseInt(userTimezoneOffset)));
    };

};

module.exports = checkJWT;
