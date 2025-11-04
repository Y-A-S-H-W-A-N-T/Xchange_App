import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query GetUsers {
    getUsers {
      id
      name
      number
      password
    }
  }
`;

export const ADD_USER = gql`
  mutation RegisterUser($name: String, $number: String, $password: String) {
    registerUser(name: $name, number: $number, password: $password) {
      id
      name
      number
      password
    }
  }
`;

export const Sign_In = gql`
  mutation SignIn($number: String, $password: String) {
    signIn(number: $number, password: $password) {
      message
      user {
        id
        name
        number
        password
      }
    }
  }
`;

export const Add_Product_Sell = gql`
  mutation Mutation($input: product_sell_input) {
    addProduct_Sell(input: $input) {
      message
      product {
        id
        productName
        type
        price
        description
        images
        xchange
        timestamp
        location
        userNumber
        ownerDetails {
          ownerName
          ownerPhoneNumber
        }
        tags
      }
    }
  }
`;

export const Add_Product_Lend = gql`
  mutation Mutation($input: product_lend_input) {
    addProduct_Lend(input: $input) {
      message
      product {
        id
        productName
        type
        price
        description
        images
        xchange
        timestamp
        days
        location
        userNumber
        ownerDetails {
          ownerName
          ownerPhoneNumber
        }
        tags
      }
    }
  }
`;

export const get_Products_Borrow = gql`
  query Query {
    getProduct_Borrow {
      id
      productName
      type
      price
      description
      images
      xchange
      timestamp
      days
      location
      userNumber
      ownerDetails {
        ownerName
        ownerPhoneNumber
      }
      tags
    }
  }
`;

export const get_Products_Buy = gql`
  query Query {
    getProduct_Buy {
      id
      productName
      type
      price
      description
      images
      xchange
      timestamp
      location
      userNumber
      ownerDetails {
        ownerName
        ownerPhoneNumber
      }
      tags
    }
  }
`;

export const get_Products_Buy_Details = gql`
  query GetProduct_Buy_Details($getProductBuyDetailsId: ID!) {
    getProduct_Buy_Details(id: $getProductBuyDetailsId) {
      id
      productName
      type
      price
      description
      images
      xchange
      timestamp
      location
      userNumber
      ownerDetails {
        ownerName
        ownerPhoneNumber
      }
      tags
    }
  }
`;

export const get_Products_Borrow_Details = gql`
  query GetProduct_Borrow_Details($getProductBorrowDetailsId: ID!) {
    getProduct_Borrow_Details(id: $getProductBorrowDetailsId) {
      id
      productName
      type
      price
      description
      images
      xchange
      timestamp
      days
      location
      userNumber
      ownerDetails {
        ownerName
        ownerPhoneNumber
      }
      tags
    }
  }
`;

export const getUserChats = gql`
  query GetUserChats($number: String) {
    getUserChats(number: $number) {
      productID
      productName
      chatPartner
      chatID
    }
  }
`;

export const uploadPFP = gql`
  mutation Mutation($pfp: String, $number: String) {
    uploadPFP(pfp: $pfp, number: $number) {
      message
      status
    }
  }
`;

export const GET_USER = gql`
  query GetUser($number: String) {
    getUser(number: $number) {
      name
      number
      pfp
    }
  }
`;
