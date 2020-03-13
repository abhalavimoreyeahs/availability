var mongodb = require("mongodb")

 const Validator = {

    isValid(data) {
        if (!data || data == undefined || data == null || data == "") {
            return false;
        }
        return true;
    },
    isValidId(id) {
        return !isNaN(id);
        //mongodb.ObjectID.isValid(id)
    },
    isValidString(str, len) {
        if (!str || str.length === 0 || typeof str !== 'string') return false;
        if (len && str.length < len) return false;
        return true;
    },
    isValidEmail(email) {
        if (!email) return false;
        return REGEX_EMAIL.test(String(email.trim()).toLowerCase());
    },
    isValidPassword(name) {
        // Check if the value is greater or equal to 5 characters
        return (name.length >= 6);
    },
    isValidEmailHash(id) {
        return (id.length === 40);
    },
}

module.exports = Validator;