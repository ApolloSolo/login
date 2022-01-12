const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "User name cannot be blank"]
    },
    password: {
        type: String,
        required: [true, "Password name cannot be blank"]
    }
})

//define methods that will be added to the model
userSchema.statics.findAndValidate = async function(username, password){
    const foundUser = await this.findOne({ username }); //"this" refers the existing instance of the model
    const isValid = await bcrypt.compare(password, foundUser.password); //returns true or false
    return isValid ? foundUser : false //if true return found user object or return false.
}

//runs before saving user
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')){ //if the password has not been modified, move on
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12); //update password to hash
    next(); //this will then go on to save user
})

module.exports = mongoose.model('User', userSchema);