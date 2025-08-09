import mongoose from "mongoose";

const ownerDetails = new mongoose.Schema({
    ownerName:{
        type:String,
    },
    ownerPhoneNumber:{
       type:Number,
    },
    // since:{
    //     type:String,
    // },
    // dealsDone:{
    //    type:Number,
    // },
    // rating:{
    //     type:String,
    // }
})

export const productsLendSchema= new mongoose.Schema({
    productName:{
        type:String,
    },
    type: {
        type: String
    },
    price:{
        type:String,
    },
    description: {
        type: String
    },
    price:{
        type:String,
    },
    xchange: {
        type: String
    },
    timestamp: {
        type: String
    },
    images: {
        type: [String]
    },
    days: {
        type: String
    },
    location: {
        type: String
    },
    userNumber: {
        type: String
    },
    ownerDetails: ownerDetails,
    tags: {
        type: [String]
    }
    //add messages here
},{
    timestamps:true
}
)


export default mongoose.model("products_lend", productsLendSchema);