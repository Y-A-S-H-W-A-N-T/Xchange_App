const typeDefs = `#graphql
    type user{
        id: ID,
        name: String,
        number: String,
        password: String
    }

    input userInput{
        name: String
        number: String,
    }


    type AuthResponse{
        user: user,
        message: String
    }

    type AddProduct_Sell_Response{
        product: product_sell,
        message: String
    }

    type AddProduct_Lend_Response{
        product: product_lend,
        message: String
    }

    type product_sell{
        id: ID!,
        productName: String,
        type: String,
        price: String,
        description: String,
        images: [String]!,
        xchange: String,
        timestamp: String,
        location: String!
        userNumber: String,
        ownerDetails: ownerDetails,
        tags: [String]!
    }

    type product_lend{
        id: ID!,
        ownerDetails: ownerDetails,
        productName: String,
        type: String,
        price: String,
        description: String,
        images: [String]!,
        xchange: String,
        timestamp: String,
        days: String!,
        location: String!
        userNumber: String,
        tags: [String]!
    }
    
    input product_sell_input{
        productName: String,
        type: String,
        price: String,
        description: String!,
        images: [String],
        xchange: String,
        timestamp: String,
        location: String!
        userNumber: String,
        ownerDetails: ownerDetailsInput,
        tags: [String]!
    }

    input ownerDetailsInput{
        ownerName: String,
        ownerPhoneNumber: String
    }

    input product_lend_input{
        productName: String,
        type: String,
        price: String,
        description: String,
        images: [String],
        xchange: String,
        timestamp: String,
        days: String!,
        location: String!,
        userNumber: String,
        ownerDetails: ownerDetailsInput,
        tags: [String]!
    }

    type ownerDetails{
        ownerName: String,
        ownerPhoneNumber: String,
    }
    
    type userChats{
        productID: String
        productName: String
        chatPartner: String
        chatID: String
    }

    type Query{
        getUsers: [user]
        getUser(number: String): user
        getProduct_Buy: [product_sell]
        getProduct_Buy_Details(id: ID!): product_sell
        getProduct_Borrow: [product_lend]
        getProduct_Borrow_Details(id: ID!): product_lend
        getUserChats(number: String): [userChats]
    }

    type Mutation{
        registerUser(name: String, number: String, password: String): user  
        signIn(number: String, password: String): AuthResponse
        addProduct_Sell(input: product_sell_input): AddProduct_Sell_Response
        addProduct_Lend(input: product_lend_input): AddProduct_Lend_Response
    }
`;

export default typeDefs;
