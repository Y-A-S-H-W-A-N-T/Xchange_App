"use client";

import { Add_Product_Lend, Add_Product_Sell } from "@/graphql/queries";
import { useMutation } from "@apollo/client";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { storage } from "../../firebase/firebase.js";

const { width, height } = Dimensions.get("window");

const Add = () => {
  const router = useRouter();
  const [lendSell, setLendSell] = useState("sell");
  const [currentStep, setCurrentStep] = useState(1);
  const [ownerPhone, setOwnerPhone] = useState<any>("");
  const totalSteps = 4;

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const toggleAnim = useRef(new Animated.Value(0)).current;

  const ownerName = "Yashwant";

  useEffect(() => {
    const fetchOwnerPhone = async () => {
      const val = await SecureStore.getItemAsync("user_phone");
      setOwnerPhone(val);
      setFormSell((prev) => ({ ...prev, ownerPhoneNumber: val }));
      setFormLend((prev) => ({ ...prev, ownerPhoneNumber: val }));
    };
    fetchOwnerPhone();
  }, []);

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep - 1) / (totalSteps - 1),
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Animate toggle
  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: lendSell === "lend" ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [lendSell]);

  const [formSell, setFormSell] = useState({
    ownerName: "",
    ownerPhoneNumber: "",
    productName: "",
    type: "",
    price: "",
    description: "",
    images: [],
    xchange: "general",
    location: "",
    tags: [] as string[], // Added tags field as an array
  });

  const [formLend, setFormLend] = useState({
    ownerName: "",
    ownerPhoneNumber: "",
    productName: "",
    type: "",
    price: "",
    description: "",
    images: [],
    xchange: "general",
    days: "",
    location: "",
    tags: [] as string[], // Added tags field as an array
  });

  const [addProductSell, { loading: loadingSell, error: errorSell }] =
    useMutation(Add_Product_Sell, {
      onCompleted: (data) => {
        if (data.addProduct_Sell.message === "Product Saved") {
          Alert.alert("Success", "Product Uploaded for Sale!");
          setFormSell({
            ownerName: "",
            ownerPhoneNumber: "",
            productName: "",
            type: "",
            price: "",
            description: "",
            images: [],
            xchange: "",
            location: "",
            tags: [], // Reset tags
          });
          router.replace("/(tabs)");
        } else {
          Alert.alert("Error", "Failed to upload product. Please try again.");
        }
      },
      onError: (err) => {
        console.log(
          "Mutation error:",
          err.networkError?.result,
          err.graphQLErrors
        );
        Alert.alert("Error", "Unexpected Error !!!");
      },
    });

  const [addProductLend, { loading: loadingLend, error: errorLend }] =
    useMutation(Add_Product_Lend, {
      onCompleted: (data) => {
        if (data.addProduct_Lend.message === "Product Saved") {
          Alert.alert("Success", "Product Uploaded for Lending!");
          setFormLend({
            ownerName: "",
            ownerPhoneNumber: "",
            productName: "",
            type: "",
            price: "",
            description: "",
            images: [],
            xchange: "",
            days: "",
            location: "",
            tags: [], // Reset tags
          });
          router.replace("/(tabs)");
        } else {
          Alert.alert("Error", "Failed to upload product. Please try again.");
        }
      },
      onError: (err) => {
        console.log(
          "Mutation error:",
          err.networkError?.result,
          err.graphQLErrors
        );
        Alert.alert("Error", "Unexpected Error !!!");
      },
    });

  const handleInputChange = (
    field: any,
    value: any,
    isLend = lendSell === "lend"
  ) => {
    if (isLend) {
      setFormLend((prev) => ({ ...prev, [field]: value }));
    } else {
      setFormSell((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleLendSellChange = (type: any) => {
    setLendSell(type);
    setCurrentStep(1);
  };

  const pickImages = async (isLend = lendSell === "lend") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Access to media library is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      aspect: [1, 1],
      quality: 1,
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

        const fileName = `xchange_images/${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 15)}.jpg`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
      });

      try {
        const newImageUrls = await Promise.all(uploadPromises);
        handleInputChange(
          "images",
          [...(isLend ? formLend.images : formSell.images), ...newImageUrls],
          isLend
        );
      } catch (error) {
        console.error("Error uploading images:", error);
        Alert.alert(
          "Upload Error",
          "Failed to upload images. Please try again."
        );
      }
    }
  };

  const removeImage = (index, isLend = lendSell === "lend") => {
    const updatedImages = (isLend ? formLend.images : formSell.images).filter(
      (_, i) => i !== index
    );
    handleInputChange("images", updatedImages, isLend);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep + 1);
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep - 1);
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const handleSubmit = async () => {
    const requiredFields: any = {
      sell: [
        "ownerName",
        "ownerPhoneNumber",
        "productName",
        "price",
        "location",
      ],
      lend: [
        "ownerName",
        "ownerPhoneNumber",
        "productName",
        "price",
        "days",
        "location",
      ],
    };

    const formData: any = lendSell === "lend" ? formLend : formSell;
    const missingFields = requiredFields[lendSell].filter(
      (field: any) =>
        !formData[field] ||
        (field === "ownerPhoneNumber" && !/^\d{10}$/.test(formData[field])) ||
        (field === "days" && !/^\d+$/.test(formData[field]))
    );

    if (missingFields.length > 0) {
      Alert.alert(
        "Missing Fields",
        "Please fill in all required fields correctly"
      );
      return;
    }

    try {
      if (lendSell === "sell") {
        await addProductSell({
          variables: {
            input: {
              timestamp: new Date().toISOString(),
              userNumber: ownerPhone,
              ownerDetails: {
                ownerName: formSell.ownerName,
                ownerPhoneNumber: formSell.ownerPhoneNumber,
              },
              productName: formSell.productName,
              type: formSell.type,
              price: formSell.price,
              description: formSell.description,
              images: formSell.images,
              xchange: formSell.xchange,
              location: formSell.location,
              tags: formSell.tags, // Include tags in mutation
            },
          },
        });
      } else {
        await addProductLend({
          variables: {
            input: {
              timestamp: new Date().toISOString(),
              userNumber: ownerPhone,
              ownerDetails: {
                ownerName: formLend.ownerName,
                ownerPhoneNumber: formLend.ownerPhoneNumber,
              },
              productName: formLend.productName,
              type: formLend.type,
              price: formLend.price,
              description: formLend.description,
              images: formLend.images,
              xchange: formLend.xchange,
              location: formLend.location,
              days: formLend.days,
              tags: formLend.tags, // Include tags in mutation
            },
          },
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert("Error", "Failed to submit product. Please try again.");
    }
  };

  const renderStep = () => {
    const formData = lendSell === "lend" ? formLend : formSell;

    switch (currentStep) {
      case 1:
        return (
          <Animated.View
            style={[
              styles.stepContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>01</Text>
              <Text style={styles.stepTitle}>Basic Information</Text>
              <Text style={styles.stepSubtitle}>
                Let's start with the basics
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Owner Name"
                  style={styles.modernInput}
                  value={formData.ownerName}
                  onChangeText={(text) => handleInputChange("ownerName", text)}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Phone Number"
                  style={styles.modernInput}
                  value={formData.ownerPhoneNumber}
                  onChangeText={(text) =>
                    handleInputChange("ownerPhoneNumber", text)
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Product Name"
                  style={styles.modernInput}
                  value={formData.productName}
                  onChangeText={(text) =>
                    handleInputChange("productName", text)
                  }
                  autoCapitalize="words"
                />
              </View>
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View
            style={[
              styles.stepContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>02</Text>
              <Text style={styles.stepTitle}>Product Details</Text>
              <Text style={styles.stepSubtitle}>
                Tell us more about your product
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Type (e.g., electric, mechanical)"
                  style={styles.modernInput}
                  value={formData.type}
                  onChangeText={(text) => handleInputChange("type", text)}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder={
                    lendSell === "sell"
                      ? "Price (e.g., $50)"
                      : "Price (e.g., $10/day)"
                  }
                  value={formData.price}
                  style={styles.modernInput}
                  onChangeText={(text) => handleInputChange("price", text)}
                  keyboardType="numeric"
                />
              </View>
              {lendSell === "lend" && (
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Days (e.g., 7)"
                    value={formData.days}
                    style={styles.modernInput}
                    onChangeText={(text) => handleInputChange("days", text)}
                    keyboardType="numeric"
                  />
                </View>
              )}
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Location"
                  style={styles.modernInput}
                  value={formData.location}
                  onChangeText={(text) => handleInputChange("location", text)}
                  autoCapitalize="words"
                />
              </View>
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View
            style={[
              styles.stepContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>03</Text>
              <Text style={styles.stepTitle}>Upload Media</Text>
              <Text style={styles.stepSubtitle}>
                Add photos to showcase your product
              </Text>
            </View>

            <View style={styles.mediaSection}>
              {formData.images.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.imageGallery}
                  contentContainerStyle={styles.imageGalleryContent}
                >
                  {formData.images.map((uri, index) => (
                    <Animated.View key={index} style={styles.imageCard}>
                      <Image source={{ uri }} style={styles.productImage} />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeImage(index)}
                        activeOpacity={0.8}
                      >
                        <Feather name="x" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </ScrollView>
              )}

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => pickImages()}
                activeOpacity={0.8}
              >
                <View style={styles.uploadIconContainer}>
                  <Feather name="camera" size={24} color="#6B7280" />
                </View>
                <Text style={styles.uploadText}>Add Photos</Text>
                <Text style={styles.uploadSubtext}>Tap to select images</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View
            style={[
              styles.stepContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>04</Text>
              <Text style={styles.stepTitle}>Final Details</Text>
              <Text style={styles.stepSubtitle}>Add description and tags</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Product description..."
                  value={formData.description}
                  onChangeText={(text) =>
                    handleInputChange("description", text)
                  }
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              {/* Tags Input and Display */}
              <View style={[styles.inputContainer, {display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}]}>
                <TextInput
                  style={styles.modernInput}
                  placeholder="Add tags and press Enter"
                  value={formData?.newTag || ""}
                  onChangeText={(text) => handleInputChange("newTag", text)}
                  onSubmitEditing={() => {
                    if (
                      formData?.newTag &&
                      !formData.tags.includes(formData.newTag)
                    ) {
                      handleInputChange("tags", [
                        ...formData.tags,
                        formData.newTag,
                      ]);
                      handleInputChange("newTag", ""); // Clear input after adding
                    }
                  }}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                <TouchableOpacity
                  style={[styles.addTagButton, {display: 'flex', flexDirection: 'row', alignItems: 'center'}]}
                  onPress={() => {
                    if (
                      formData?.newTag &&
                      !formData.tags.includes(formData.newTag)
                    ) {
                      handleInputChange("tags", [
                        ...formData.tags,
                        formData.newTag,
                      ]);
                      handleInputChange("newTag", ""); // Clear input after adding
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Feather name="plus" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tagsGallery}
                contentContainerStyle={styles.tagsGalleryContent}
              >
                {formData.tags.map((tag, index) => (
                  <View key={index} style={styles.tagCard}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity
                      style={styles.removeTagButton}
                      onPress={() =>
                        handleInputChange(
                          "tags",
                          formData.tags.filter((_, i) => i !== index)
                        )
                      }
                      activeOpacity={0.8}
                    >
                      <Feather name="x" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (loadingSell || loadingLend) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={loadingSell || loadingLend}
            >
              <Text style={styles.submitButtonText}>
                {loadingSell || loadingLend
                  ? "Publishing..."
                  : `Publish for ${
                      lendSell.charAt(0).toUpperCase() + lendSell.slice(1)
                    }`}
              </Text>
              {!(loadingSell || loadingLend) && (
                <Feather
                  name="arrow-right"
                  size={20}
                  color="#FFFFFF"
                  style={styles.submitIcon}
                />
              )}
            </TouchableOpacity>
          </Animated.View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Product</Text>
            <Text style={styles.headerSubtitle}>
              Share your items with the community
            </Text>
          </View>

          {/* Toggle Section */}
          <View style={styles.toggleSection}>
            <View style={styles.toggleContainer}>
              <Animated.View
                style={[
                  styles.toggleSlider,
                  {
                    transform: [
                      {
                        translateX: toggleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, (width * 0.9 - 40) / 2],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <TouchableOpacity
                style={styles.toggleOption}
                onPress={() => handleLendSellChange("sell")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.toggleText,
                    lendSell === "sell" && styles.toggleTextActive,
                  ]}
                >
                  Sell
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toggleOption}
                onPress={() => handleLendSellChange("lend")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.toggleText,
                    lendSell === "lend" && styles.toggleTextActive,
                  ]}
                >
                  Lend
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Step {currentStep} of {totalSteps}
            </Text>
          </View>

          {/* Form Content */}
          <View style={styles.formCard}>{renderStep()}</View>

          {/* Navigation */}
          <View style={styles.navigationContainer}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={prevStep}
                activeOpacity={0.8}
              >
                <Feather name="arrow-left" size={20} color="#6B7280" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            {currentStep < totalSteps && (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={nextStep}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
                <Feather name="arrow-right" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  toggleSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    padding: 4,
    position: "relative",
  },
  toggleSlider: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: (width * 0.9 - 40) / 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  toggleTextActive: {
    color: "#111827",
  },
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginBottom: 12,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#111827",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
  formCard: {
    marginHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  stepContainer: {
    minHeight: 300,
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  stepNumber: {
    fontSize: 48,
    fontWeight: "900",
    color: "#E5E7EB",
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  inputGroup: {
    gap: 20,
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderColor: "#a2a2a4ff",
  },
  modernInput: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  textAreaContainer: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
    minHeight: 120,
  },
  mediaSection: {
    alignItems: "center",
  },
  imageGallery: {
    marginBottom: 24,
  },
  imageGalleryContent: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  imageCard: {
    width: 100,
    height: 100,
    borderRadius: 16,
    marginHorizontal: 8,
    position: "relative",
    backgroundColor: "#F3F4F6",
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButton: {
    width: "100%",
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    color: "#6B7280",
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#111827",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  submitIcon: {
    marginLeft: 8,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: "#111827",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginRight: 8,
  },
  addTagButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#111827",
    marginRight: 8,
  },
  tagsGallery: {
    marginTop: 10,
    maxHeight: 50,
  },
  tagsGalleryContent: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  tagCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    position: "relative",
  },
  tagText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    marginRight: 8,
  },
  removeTagButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Add;
