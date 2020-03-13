const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const checkJWT = require('../../utils/check.jwt');
const encryptConfig = require('../../../config/encrypt');
const ObjectId = require('mongodb').ObjectID;

const mongoose = require('mongoose');

const Users = mongoose.model('Users');
const validator = require('../../utils/validator');
const Error =  require('../../custom/ErrorHandler');
class AuthController {

    signup =  async (req, res) => {
        try {
            let { firstname, lastname, email,  password ,timezoneOffset} = req.body;

            console.log(req.body);

            // Check validations
            let AddErrors = new Error(Bad_Request);

            if (!email || !validator.isValidEmail(email)) {
                AddErrors.addRequestError('Invalid email.');
            }
            if (!password || !validator.isValidPassword(password)) {
                AddErrors.addRequestError('Invalid password.');
            }
            if (!firstname || !validator.isValidString(firstname)) {
                AddErrors.addRequestError('Invalid firstname.');
            }
            if (!lastname || !validator.isValidString(lastname)) {
                AddErrors.addRequestError('Invalid lastname.');
            }

            if (AddErrors.isErrors()) {
               // logger.error(`${"invalid Parameters"} ${req.originalUrl}`);
                return res.status(paramErrors.code).json({ success: false, error: paramErrors, message: "Invalid Parameters" });
            }

            email = username.toLowerCase();
            firstname = validator.toLowerCase(firstname);
            lastname = validator.toLowerCase(lastname);

            const emailRegex = new RegExp(`^${email.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');
            const findUser = await Users.findOne({ 'username': emailRegex });

            if (findUser && findUser._id && findUser.username) {
                return res.status(OK).json({ success: false, message: 'Email is already registered.'});
            }

            // Convert pass to hash & salt
            const { encrypted, salt } = await checkJWT.saltPassword(password);
            const emailHash = crypto.randomBytes(20).toString('hex');

            const usrObj = {
                username, password: encrypted, firstname, lastname, emailHash, salt, userId:  ObjectId()
            };
            if(timezoneOffset){
               usrObj.timezoneOffset = parseInt(timezoneOffset);
            }
            const newUser = new Users(usrObj);
            newUser.firstname = firstname;
            newUser.lastname = lastname;
            newUser.email = email;
            newUser.password = encrypted;
            newUser.salt =  salt;
            newUser.emailHash = emailHash;
            newUser.userId = ObjectId();
            let saveUser = await newUser.save();
            console.log(saveUser)

            if (!saveUser || !saveUser.username || saveUser.username !== username) {
                return res.status(OK).json({ success: false, error: new TaError(OK).addParamError('Unable to register user.'), message: 'Unable to register user.' });
            }

            const token = jwt.sign(
                { userId: saveUser.id, username: saveUser.username },
                encryptConfig.secret,
                { expiresIn: "100d" }
            );

            delete saveUser.password;
            delete saveUser.salt;
            delete saveUser.emailHash;
            delete saveUser.encrypted;
            delete saveUser._id;

            return res.status(Created).json({
                success: true,
                message: "success",
                token,
                user: saveUser,
                newUser: true
            });

        } catch (error) {
            console.error('signup error:', error);
            logger.error(`${error} ${req.originalUrl}`);
            res.status(Server_Error).json({ success: false, error: error });
        }
    };
}

module.exports = AuthController;