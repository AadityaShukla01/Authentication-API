import mongoose from "mongoose";

//defining schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    tc: {
        type: Boolean,
        required: true
    },
})


//creating model from schema
const userModel = mongoose.model("User", userSchema)
export default userModel;