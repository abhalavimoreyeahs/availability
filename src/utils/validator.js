var mongodb = require("mongodb")

const Validator = {

    isValid(data) {
        if (!data || data == undefined || data == null || data == "") {
            return false;
        }
        return true;
    },
    isValidId(id) {

        if (mongodb.ObjectID.isValid(id) && isNaN(id)) return true;
        return false;
    },
    isValidString(str, len) {
        if (!str || str.length === 0 || typeof str !== 'string') return false;
        if (len && str.length < len) return false;
        return true;
    },
    isValidEmail(email) {
        if (!email) return false;
        return true;
        //return REGEX_EMAIL.test(String(email.trim()).toLowerCase());
    },
    isValidPassword(password) {
        // Check if the value is greater or equal to 5 characters
        return (password.length >= 6);
    },
}

module.exports = Validator;