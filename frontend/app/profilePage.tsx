import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { storage } from "../firebase/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import axios from "axios";
import { useMutation, useQuery } from "@apollo/client";
import { GET_USER, uploadPFP } from "@/graphql/queries";

export default function ProfilePage() {
  const [profileImage, setProfileImage] = useState<any>(null);
  const [userNumber, setUserNumber] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const fetchOwnerPhone = async () => {
      const val = await SecureStore.getItemAsync("user_phone");
      setUserNumber(val);
    };
    fetchOwnerPhone();
  }, []);

  const { data: user_data, loading, error, refetch } = useQuery(GET_USER,{
    variables: {
      number: userNumber
    }
  })

  console.log(user_data)

  const [upload_pfp, { loading: uploadLoading, error: uploadError }] =
  useMutation(uploadPFP, {
    onCompleted: (data) => {
      if (data.uploadPFP.status === "200") {
        Alert.alert("Success", "PFP Updated");
        refetch();
      } else {
        Alert.alert("Error", "Failed to upload product. Please try again.");
      }
    },
    onError: (err) => {
      console.log(
        "Mutation error:",
      );
      Alert.alert("Error", "Error in Uploading PFP, Please try again later !!!");
    },
  });

  // Request permission and pick image

  const UploadPFP = async (url: string[]) => {
    await upload_pfp({
      variables: {
        number: userNumber,
        pfp: url[0]
      }
    });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImageUris = result.assets.map((asset) => asset.uri);
      const uploadPromises = newImageUris.map(async (uri) => {
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => resolve(xhr.response);
          xhr.onerror = () => reject(new Error("Image upload failed"));
          xhr.responseType = "blob";
          xhr.open("GET", uri, true);
          xhr.send(null);
        });

        const fileName = `xchange_images/profile_pictures/${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 15)}.jpg`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
      });

      try {
        const newImageUrls = await Promise.all(uploadPromises);
        setProfileImage(newImageUrls);
        console.log(newImageUrls);
        UploadPFP(newImageUrls)
      } catch (error) {
        console.error("Error uploading PFP:", error);
        Alert.alert("Upload Error", "Failed to upload PFP. Please try again.");
      }
    }
  };

  console.log(user_data?.getUser?.pfp)

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Profile Image Circle */}
      <View style={styles.imageContainer}>
        <View style={styles.circle}>
          {user_data?.getUser?.pfp ? (
            <Image
              source={{ uri: user_data?.getUser?.pfp }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="person-outline" size={60} color="#999" />
            </View>
          )}
        </View>

        <View style={styles.userNumber}>
          <Ionicons name="person-outline" size={16} color="#999" />
          <Text style={{ marginLeft: 8 }}>{user_data?.getUser?.name}</Text>
        </View>

        <View style={styles.userNumber}>
          <Ionicons name="phone-portrait-outline" size={16} color="#999" />
          <Text style={{ marginLeft: 8 }}>{user_data?.getUser?.number}</Text>
        </View>

        {/* Edit Pencil Icon */}
        <TouchableOpacity style={styles.editButton} onPress={pickImage}>
          <Ionicons name="pencil" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Products & Deals Boxes */}
      <View style={styles.boxContainer}>
        <TouchableOpacity style={styles.box}>
          <Ionicons name="cart-outline" size={32} color="#000" />
          <Text style={styles.boxText}>Products</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box}>
          <Ionicons name="pricetag-outline" size={32} color="#000" />
          <Text style={styles.boxText}>Deals</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? 40 : 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  backButton: {
    padding: 4,
  },
  userNumber: {
    display: "flex",
    marginTop: 18,
    marginLeft: 5,
    flexDirection: "row",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 40,
    position: "relative",
  },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#f0f0f0",
    borderWidth: 3,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    position: "absolute",
    right: 140,
    top: 0,
    backgroundColor: "#000",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  boxContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
  },
  box: {
    width: 110,
    height: 110,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 16,
  },
  boxText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
});
