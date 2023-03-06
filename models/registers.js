const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

const userschema = new mongoose.Schema({
    username :{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
})



//create a collection
const Register =new mongoose.model('Register',userschema);

module.exports = Register;