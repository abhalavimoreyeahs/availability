const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const checkJWT = require('../../utils/check.jwt');
const encryptConfig = require('../../../config/encrypt');
const ObjectId = require('mongodb').ObjectID;

const mongoose = require('mongoose');

const Users = mongoose.model('Users');
const validator = require('../../utils/validator');
const Error =  require('../../custom/ErrorHandler');
const AuthController = {

    signup : async (req, res) => {
        try {
            let { firstname, lastname, email,  password ,timezoneOffset} = req.body;

            console.log(req.body);

            // Check validations
            let AddErrors = new Error(400);

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
                return res.status(paramErrors.code).json({ success: false, error: AddErrors, message: "Invalid Parameters" });
            }

            email = email.toLowerCase();
            firstname = firstname.toLowerCase();
            lastname = lastname.toLowerCase();

            const emailRegex = new RegExp(`^${email.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');
            const findUser = await Users.findOne({ 'email': emailRegex });

            if (findUser && findUser._id && findUser.email) {
                return res.status(400).json({ success: false, message: 'Email is already registered.'});
            }

            // Convert pass to hash & salt
            const { encrypted, salt } = await checkJWT.saltPassword(password);
          
            if(timezoneOffset){
               timezoneOffset = parseInt(timezoneOffset);
            }
            const newUser = new Users();
            newUser.firstname = firstname;
            newUser.lastname = lastname;
            newUser.email = email;
            newUser.password = encrypted;
            newUser.salt =  salt;
            newUser.userId = ObjectId();
            let saveUser = await newUser.save();
            console.log(saveUser)

            if (!saveUser || !saveUser.userId || saveUser.email !== email) {
                return res.status(400).json({ success: false, error: new TaError(OK).addParamError('Unable to register user.'), message: 'Unable to register user.' });
            }

            const token = jwt.sign(
                { userId: saveUser.id, email: saveUser.email },
                encryptConfig.secret,
                { expiresIn: "100d" }
            );

            delete saveUser.password;
            delete saveUser.salt;
            delete saveUser.emailHash;
            delete saveUser.encrypted;
            delete saveUser._id;

            return res.status(200).json({
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
    },

    login: async (req, res) => {
        try {
            let { email, password } = req.body;

            let AddErrors = new Error(400);

            if (!email || !validator.isValidEmail(email)) {
                AddErrors.addRequestError('Invalid Email.');
            }
            if (!password || !validator.isValidPassword(password)) {
                AddErrors.addRequestError('Invalid Password.');
            }
            if (AddErrors.isErrors()) {
                return res.status(400).json({ success: false, error: AddErrors, message: "Invalid Parameters" });
            }

            email = email.toLowerCase();

            // Look in database for user
            let findUser = await Users.findOne({ 'email': email });

            // Check if valid user returned, return error if needed
            if (!findUser || !findUser.id) {
                return res.status(Bad_Request).json({ success: false, message: "Invalid username/password."});
            }

            // HASH and SALT password, compare to database password
            const decryptedPass = await checkJWT.decryptPassword(password, findUser.salt);

            if (decryptedPass !== findUser.password) {
                return res.status(400).json({ success: false, error: error });
            }

            const token = jwt.sign(
                {
                    userId: findUser.id,
                    email: findUser.email,
                    company: findUser.company,
                    firstName: findUser.firstName,
                    lastName: findUser.lastName,
                   
                },
                encryptConfig.secret,
                { expiresIn: "100d" }
            );

            // delete findUser.password;
            // delete findUser.salt;
            // delete findUser.encrypted;
            // delete findUser._id;
            // delete findUser.userId;

            return res.status(200).json({
                success: true,
                token,
                //user: findUser,
            });
        }
        catch (error) {
            console.error('login error:', error);
           return res.status(500).json({ success: false, error: error });
        }
    },
}

module.exports = AuthController;