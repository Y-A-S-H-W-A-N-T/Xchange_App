import mongoose from "mongoose";

export const userSchema= new mongoose.Schema({
    name:{
        type:String,
    },
    number:{
       type:Number,
       unique:true, // manage this error, throw number already exists error in frontend
    },
    password:{
        type:String,
    },
    pfp: {
        type: String
    }
},{
    timestamps:true
}
)


export default mongoose.model("user", userSchema);