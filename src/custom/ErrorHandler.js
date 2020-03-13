module.exports = class Error {
    constructor(code) {
        this.errors = [];
        this.code = code;
    }

    addRequestError(message) {
        this.errors.push({
            reason: 'invalidParameter',
            message
        });

        return this;
    }
    
    isErrors() {
        return this.errors.length > 0;
    }

};
