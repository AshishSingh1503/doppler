import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: { 
        type: String, 
        unique: true 
    },
    password: String,
});

const User = mongoose.model("Users", userSchema);

export default User ;