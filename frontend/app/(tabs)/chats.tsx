import { getUserChats } from "@/graphql/queries";
import { useQuery } from "@apollo/client";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as SecureStore from "expo-secure-store";

interface Chat {
  productID: string;
  productName: string;
  chatPartner: string;
  chatID: string;
  messages: { sender: string; messageSent: string }[];
}

interface ChatsProps {}

const colors = {
  white: "#FFFFFF",
  lightGray: "#F5F5F5",
  mediumGray: "#E0E0E0",
  darkGray: "#999999",
  black: "#000000",
};

const Chats: React.FC<ChatsProps> = () => {
  const [userNumber, setUserNumber] = useState<string>("");

  const fetchUserNumber = async () => {
    const val: any = await SecureStore.getItemAsync("user_phone");
    setUserNumber(val);
  };

  useEffect(() => {
    fetchUserNumber();
  }, []);
  const router = useRouter();
  console.log("????? ", userNumber);
  const { data, loading, error } = useQuery(getUserChats, {
    variables: { number: userNumber },
  });

  console.log("Comming data = ", data);

  const getChatPartner = (chatID: string, userNumber: string) => {
    const [, productOwner, chatPartner] = chatID.split("-");
    return userNumber === productOwner ? chatPartner : productOwner;
  };

  const renderChat = ({ item }: { item: Chat }) => {
    const [productID, productOwner, chatPartnerNumber] = item.chatID.split("-");

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          router.push({
            pathname: "/products/chat/[chat]",
            params: {
              productID,
              productName: item.productName,
              productOwner,
              userNumber: chatPartnerNumber,
            },
          })
        }
      >
        <View style={styles.chatContent}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.chatPartner}>
            Chat with {getChatPartner(item.chatID, userNumber as string)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {data && 
      <View>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chats</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.allChats}>
          <FlatList
            data={data.getUserChats}
            renderItem={renderChat}
            keyExtractor={(item) => item.chatID}
            contentContainerStyle={styles.chatList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.black,
  },
  headerPlaceholder: {
    width: 40,
  },
  chatList: {
    padding: 16,
  },
  chatItem: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chatContent: {
    flexDirection: "column",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 4,
  },
  chatPartner: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.darkGray,
    marginBottom: 4,
  },
  latestMessage: {
    fontSize: 14,
    color: colors.darkGray,
  },
  allChats: {
    marginBottom: 150,
  },
});

export default Chats;
