import mongoose from "mongoose";

const message = new mongoose.Schema({
  sender: {
    type: String // store user/owner number
  },
  messageSent: {
    type: String
  }
});

const dealDone = new mongoose.Schema({
  productID: {
    type: String
  },
  productName: {
    type: String
  },
  productActualPrice: {
    type: String
  },
  productOwner: {
    type: String
  },
  productType: {
    type: String // Borrow | Bought
  },
  date: {
    type: String
  },
  timeOfXchange: {
    type: String
  },
  FinalPrice: {
    type: String
  },
  dealDetails: {
    type: String
  }
});

const dealMade = new mongoose.Schema({
   productID: {
    type: String
  },
  productName: {
    type: String
  },
  productActualPrice: {
    type: String
  },
  soldTo: {
    type: String // customer ID who bought/borrowed this prodcut
  },
  productType: {
    type: String // Borrow | Bought
  },
  date: {
    type: String
  },
  timeOfXchange: {
    type: String
  },
  FinalPrice: {
    type: String
  },
  dealDetails: {
    type: String
  }
});

const chatSpace = new mongoose.Schema({
  productID: {
    type: String
  },
  productName: {
    type: String
  },
  chatPartner: {
    type: String
  },
  chatID: {
    type: String
  },
  messages: [message]
});

export const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    number: {
      type: Number,
      unique: true, // manage this error, throw number already exists error in frontend
    },
    password: {
      type: String,
    },
    pfp: {
      type: String,
    },
    chatSpace: [chatSpace],
    dealsDone: [dealDone],
    dealsMade: [dealMade]
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("user", userSchema);
