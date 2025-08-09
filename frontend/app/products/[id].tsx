import Navbar from "@/components/Navbar";
import { get_Products_Borrow_Details, get_Products_Buy_Details } from "@/graphql/queries";
import { useQuery } from "@apollo/client";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Mock data - replace with actual data fetching
const mockProductData = {
  ownerName: "John Smith",
  ownerPhoneNumber: "+1 (555) 123-4567",
  productName: "Vintage Leather Jacket",
  type: "Clothing",
  price: "$85",
  description:
    "A beautiful vintage leather jacket in excellent condition. Perfect for casual wear or special occasions. Made from genuine leather with a classic design that never goes out of style.",
  images: [
    "https://via.placeholder.com/400x400/333333/FFFFFF?text=Image+1",
    "https://via.placeholder.com/400x400/666666/FFFFFF?text=Image+2",
    "https://via.placeholder.com/400x400/999999/FFFFFF?text=Image+3",
  ],
  xchange: "Available for exchange",
  timestamp: "2024-01-15T10:30:00Z",
  days: "3 days ago",
  location: "New York, NY",
  userNumber: "USER001",
  tags: ["Vintage", "Leather", "Fashion", "Premium", "Unisex"],
};

export default function Product() {
  const { id, type } = useLocalSearchParams();
  console.log("------------", id);
  const query: any =
    type === "buy"
      ? get_Products_Buy_Details
      : type === "borrow"
      ? get_Products_Borrow_Details
      : null;

  const variables =
    type === "buy"
      ? { getProductBuyDetailsId: id }
      : type === "borrow"
      ? { getProductBorrowDetailsId: id }
      : {};

  const { data, loading, error } = useQuery(query, {
    variables,
    skip: !id || !query,
  });
  console.log(data)
  const productData = type === 'buy'? data?.getProduct_Buy_Details : data?.getProduct_Borrow_Details;
  const [activeTab, setActiveTab] = useState("details");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const product = mockProductData;

  const renderImagePagination = () => (
    <View style={styles.paginationContainer}>
      {productData?.images.map((_: any, index: any) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            currentImageIndex === index && styles.paginationDotActive,
          ]}
        />
      ))}
    </View>
  );

  const renderTags = () => (
    <View style={styles.tagsContainer}>
      {productData?.tags.map((tag, index) => (
        <View key={index} style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ))}
    </View>
  );

  const renderDetailsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type:</Text>
          <Text style={styles.detailValue}>{productData?.type}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Condition:</Text>
          <Text style={styles.detailValue}>{productData?.xchange}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={styles.detailValue}>{productData?.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Posted:</Text>
          <Text style={styles.detailValue}>{product.days}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{productData?.description}</Text>
      </View>

      {renderTags()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Info</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#666" />
            <Text style={styles.infoCardTitle}>Verified</Text>
            <Text style={styles.infoCardText}>Product verified</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="swap-horizontal-outline" size={24} color="#666" />
            <Text style={styles.infoCardTitle}>Exchange</Text>
            <Text style={styles.infoCardText}>Available</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="location-outline" size={24} color="#666" />
            <Text style={styles.infoCardTitle}>Local</Text>
            <Text style={styles.infoCardText}>Pickup available</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderOwnerTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Owner Information</Text>
        <View style={styles.ownerCard}>
          <View style={styles.ownerAvatar}>
            <Text style={styles.ownerAvatarText}>
              {productData?.ownerDetails?.ownerName
                .split(" ")
                .map((n: any) => n[0])
                .join("")}
            </Text>
          </View>
          <View style={styles.ownerInfo}>
            <Text style={styles.ownerName}>
              {productData?.ownerDetails?.ownerName}
            </Text>
            <Text style={styles.ownerDetail}>
              User ID: {product.userNumber}
            </Text>
            <Text style={styles.ownerDetail}>Member since 2023</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Details</Text>
        <TouchableOpacity style={styles.contactRow}>
          <Ionicons name="call-outline" size={20} color="#333" />
          <Text style={styles.contactText}>
            {productData?.ownerDetails?.ownerPhoneNumber}
          </Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactRow}>
          <Ionicons name="chatbubble-outline" size={20} color="#333" />
          <Text style={styles.contactText}>Send Message</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seller Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Items Sold</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>95%</Text>
            <Text style={styles.statLabel}>Response Rate</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Tips</Text>
        <View style={styles.safetyTip}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.safetyText}>
            Always meet in a public place and inspect the item before purchase.
          </Text>
        </View>
        <View style={styles.safetyTip}>
          <Ionicons name="shield-outline" size={20} color="#666" />
          <Text style={styles.safetyText}>
            Never share personal financial information.
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Navbar />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Images */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setCurrentImageIndex(index);
            }}
          >
            {productData?.images.map((image: any, index: any) => {
              return (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.productImage}
                />
              );
            })}
          </ScrollView>
          {renderImagePagination()}

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#333" : "#666"}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.productTitleContainer}>
              <Text style={styles.productName}>{productData?.productName}</Text>
              <Text style={styles.productLocation}>
                {productData?.location}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{productData?.price}</Text>
              <Text style={styles.postedTime}>{product.days}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <View style={styles.tabHeader}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "details" && styles.activeTab]}
              onPress={() => setActiveTab("details")}
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={activeTab === "details" ? "#333" : "#999"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "details" && styles.activeTabText,
                ]}
              >
                Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "owner" && styles.activeTab]}
              onPress={() => setActiveTab("owner")}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={activeTab === "owner" ? "#333" : "#999"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "owner" && styles.activeTabText,
                ]}
              >
                About Owner
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContentContainer}>
            {activeTab === "details" ? renderDetailsTab() : renderOwnerTab()}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons name="heart-outline" size={20} color="#333" />
          <Text style={styles.secondaryButtonText}>Save for Later</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={()=>router.push({pathname: '/products/chat/[chat]', params: { productID: productData?.id, productName: productData?.productName }})}>
          <Text style={styles.primaryButtonText}>Ask Product</Text>
          <Ionicons name="hand-right-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
  },
  productImage: {
    width: width,
    height: 300,
    backgroundColor: "#f5f5f5",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#fff",
    width: 20,
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  productTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  productLocation: {
    fontSize: 14,
    color: "#666",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  postedTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  tabContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#333",
  },
  tabText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#333",
  },
  tabContentContainer: {
    flex: 1,
    minHeight: 400,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  infoCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  infoCardTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  ownerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  ownerAvatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  ownerDetail: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  safetyTip: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  safetyText: {
    flex: 1,
    fontSize: 12,
    color: "#666",
    marginLeft: 12,
    lineHeight: 16,
  },
  floatingButtons: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 12,
    marginBottom: 30,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "#333",
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
