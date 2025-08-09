"use client"

import { get_Products_Borrow } from "@/graphql/queries"
import { useQuery } from "@apollo/client"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

const { width, height } = Dimensions.get("window")

const Borrow = () => {
  const { data, loading, error, refetch } = useQuery(get_Products_Borrow)
  const All_Borrow_Products = data?.getProduct_Borrow
  const router = useRouter()
  console.log("-->",data)

  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchFocused, setSearchFocused] = useState(false)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const searchAnim = useRef(new Animated.Value(0)).current
  const headerAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (All_Borrow_Products) {
      setFilteredProducts(All_Borrow_Products)
      // Animate in the content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [All_Borrow_Products])

  useEffect(() => {
    // Animate header on mount
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()
  }, [])

  useEffect(() => {
    if (All_Borrow_Products) {
      const filtered = All_Borrow_Products.filter(
        (product) =>
          product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredProducts(filtered)
    }
  }, [searchQuery, All_Borrow_Products])

  const handleSearchFocus = () => {
    setSearchFocused(true)
    Animated.timing(searchAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const handleSearchBlur = () => {
    setSearchFocused(false)
    Animated.timing(searchAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const SkeletonCard = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      )
      shimmer.start()
      return () => shimmer.stop()
    }, [])

    const opacity = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    })

    return (
      <View style={styles.skeletonCard}>
        <Animated.View style={[styles.skeletonImage, { opacity }]} />
        <View style={styles.skeletonContent}>
          <Animated.View style={[styles.skeletonTitle, { opacity }]} />
          <Animated.View style={[styles.skeletonDescription, { opacity }]} />
          <Animated.View style={[styles.skeletonLocation, { opacity }]} />
          <Animated.View style={[styles.skeletonPrice, { opacity }]} />
          <Animated.View style={[styles.skeletonDays, { opacity }]} />
        </View>
      </View>
    )
  }

  const ProductCard = ({ item, index }) => {
    const cardAnim = useRef(new Animated.Value(0)).current
    const scaleAnim = useRef(new Animated.Value(1)).current

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }).start()
    }, [])

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start()
    }

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start()
    }

    const handlePress = () => {
      router.push({
        pathname: `/products/${item.id}`,
        params: {
          data: JSON.stringify(item),
          images: encodeURIComponent(JSON.stringify(item.images)),
          type: "borrow",
        },
      })
    }

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: cardAnim,
            transform: [
              { scale: scaleAnim },
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.productCard}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.images[0] }} style={styles.productImage} />
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>₹{item.price}</Text>
              <Text style={styles.priceSubtext}>/day</Text>
            </View>
            {item.days && (
              <View style={styles.daysTag}>
                <Feather name="calendar" size={12} color="#FFFFFF" />
                <Text style={styles.daysText}>{item.days}d</Text>
              </View>
            )}
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.productTitle} numberOfLines={1}>
              {item.productName}
            </Text>
            <Text style={styles.productDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.locationContainer}>
              <Feather name="map-pin" size={12} color="#9CA3AF" />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
            <View style={styles.borrowBadge}>
              <Feather name="clock" size={12} color="#059669" />
              <Text style={styles.borrowText}>Available to borrow</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const renderItem = ({ item, index }) => <ProductCard item={item} index={index} />

  const renderSkeletons = () => (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  )

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Feather name="clock" size={48} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>No items to borrow</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? "Try adjusting your search terms" : "Check back later for new borrowing opportunities"}
      </Text>
    </View>
  )

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.headerTitle}>Borrow Items</Text>
          <Text style={styles.headerSubtitle}>Find what you need temporarily</Text>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Feather name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for items to borrow..."
                placeholderTextColor="#9CA3AF"
                editable={false}
              />
            </View>
          </View>
        </Animated.View>
        {renderSkeletons()}
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >

        <Animated.View
          style={[
            styles.searchContainer,
            {
              transform: [
                {
                  scale: searchAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.02],
                  }),
                },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.searchBar,
              {
                borderColor: searchAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["#E5E7EB", "#111827"],
                }),
              },
            ]}
          >
            <Feather name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for items to borrow..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                <Feather name="x" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </Animated.View>
        </Animated.View>

        {searchQuery.length > 0 && (
          <Text style={styles.resultsText}>
            {filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""} found
          </Text>
        )}
      </Animated.View>

      <Animated.View
        style={[
          styles.listContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          numColumns={2}
          contentContainerStyle={styles.flatListContainer}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#111827"]}
              tintColor="#111827"
              title="Pull to refresh"
              titleColor="#6B7280"
            />
          }
          ListEmptyComponent={EmptyState}
        />
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
  },
  searchContainer: {
    marginBottom: 8,
    marginTop: 65
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    marginLeft: 12,
    fontWeight: "500",
  },
  clearButton: {
    padding: 4,
  },
  resultsText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 8,
  },
  listContainer: {
    flex: 1,
  },
  flatListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  cardContainer: {
    width: (width - 48) / 2,
    marginBottom: 20,
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  imageContainer: {
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#F3F4F6",
  },
  priceTag: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  priceSubtext: {
    fontSize: 10,
    fontWeight: "500",
    color: "#D1D5DB",
    marginLeft: 2,
  },
  daysTag: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#059669",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  daysText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 4,
  },
  cardContent: {
    padding: 16,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 6,
    fontWeight: "500",
  },
  borrowBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  borrowText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  skeletonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  skeletonCard: {
    width: (width - 48) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
  },
  skeletonImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#E5E7EB",
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonDescription: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginBottom: 6,
    width: "80%",
  },
  skeletonLocation: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginBottom: 8,
    width: "60%",
  },
  skeletonPrice: {
    height: 14,
    backgroundColor: "#E5E7EB",
    borderRadius: 7,
    width: "40%",
    marginBottom: 8,
  },
  skeletonDays: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    width: "50%",
  },
})

export default Borrow