import bcrypt from "bcrypt";
import Product_Lend from "./schemas/productsLendSchema.js";
import Product_Sell from "./schemas/productsSellSchema.js";
import User from "./schemas/userSchema.js";

const resolvers = {
  Query: {
    getUsers: async () => {
      return await User.find({});
    },
    getUser: async (_, { number }) => {
      const response = await User.findOne({ number: number });
      return response;
    },
    getProduct_Buy: async () => {
      const ProductSell = await Product_Sell.find({});
      return ProductSell;
    },
    getProduct_Borrow: async () => {
      const ProductBorrow = await Product_Lend.find({});
      return ProductBorrow;
    },
    getProduct_Buy_Details: async(_, args) => {
      const response = await Product_Sell.findById(args.id);
      return response;
    },
    getProduct_Borrow_Details: async(_, args) => {
      const response = await Product_Lend.findById(args.id);
      return response;
    },
    getUserChats: async(_,args) =>{
      const response = await User.findOne({ number: args.number })
      return response?.chatSpace
    }
  },
  Mutation: {
    registerUser: async (_, { name, number, password }) => {
      try {
        const existingUser = await User.findOne({ number });
        if (existingUser) {
          console.log("User already exists with this number");
          return {
            status: 409,
            message: "User with this number already exists",
          };
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
          name,
          number,
          password: hashedPassword,
        });

        const savedUser = await newUser.save();
        console.log("User created:", savedUser);

        return savedUser;
      } catch (error) {
        console.error("Error:", error);
        return {
          status: 500,
        };
      }
    },
    signIn: async (_, { number, password }) => {
      const response = await User.findOne({ number: number });
      if(!response){
        return {
          message: "User Not Found",
          user: null
        }
      }
      const isMatch = await bcrypt.compare(password, response.password);
      if(isMatch){
        return {
          message: "User Found",
          user: response
        }
      }
      else{
        return {
          message: "User Not Found",
          user: null
        }
      }
    },
    addProduct_Sell: async (_, { input }) => {
      console.log("CALLED",input)
      try {
        console.log(">>>>",input)
        const newProduct = new Product_Sell(input);
        const savedProduct = await newProduct.save();
        console.log("Product Saved Succesfully for Buying")
        return {
          product: savedProduct,
          message: "Product Saved"
        };
      } catch (error) {
        console.error('Error adding product:', error);
        throw new Error('Failed to add product: ' + error.message);
      }
    },
    addProduct_Lend: async (_, { input }) => {
      console.log("CALLED-----------------------",input)
      try {
        const newProduct = new Product_Lend(input);
        const savedProduct = await newProduct.save();
        console.log("Product Saved Succesfully for Borrowing")
        return {
          product: savedProduct,
          message: "Product Saved"
        };
      } catch (error) {
        console.error('Error adding product:', error);
        throw new Error('Failed to add product: ' + error.message);
      }
    }
  },
};

export default resolvers;
