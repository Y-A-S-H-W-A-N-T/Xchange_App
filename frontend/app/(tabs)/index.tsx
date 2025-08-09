"use client"

import { Feather } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const { width, height } = Dimensions.get("window")

const Home = () => {
  const { phone } = useLocalSearchParams()
  const router = useRouter()
  const scrollY = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()

    return () => clearInterval(timer)
  }, [])

  const quickActions = [
    {
      title: "Sell or Lend",
      subtitle: "List your items",
      icon: "dollar-sign",
      color: "#111827",
      route: "/(tabs)/add",
      gradient: ["#F3F4F6", "#E5E7EB"],
    },
    {
      title: "Buy or Borrow",
      subtitle: "Find what you need",
      icon: "shopping-bag",
      color: "#111827",
      route: "/(tabs)/BuyNBorrow/buy",
      gradient: ["#F3F4F6", "#E5E7EB"],
    },
  ]

  const communityCards = [
    {
      title: "College Xchange",
      desc: "Connect with your college community",
      icon: "book-open",
      members: "2.4k",
      trending: true,
    },
    {
      title: "Hostel Xchange",
      desc: "Share with your hostel mates",
      icon: "home",
      members: "1.8k",
      trending: false,
    },
    {
      title: "General Communities",
      desc: "Explore public marketplaces",
      icon: "users",
      members: "5.2k",
      trending: true,
    },
    {
      title: "Study Materials",
      desc: "Books, notes, and resources",
      icon: "file-text",
      members: "3.1k",
      trending: false,
    },
  ]

  const featuredItems = [
    {
      title: "iPhone 13 Pro",
      price: "₹45,000",
      image: "/placeholder.svg?height=80&width=80",
      type: "sell",
      location: "Campus",
    },
    {
      title: "MacBook Air M1",
      price: "₹200/day",
      image: "/placeholder.svg?height=80&width=80",
      type: "rent",
      location: "Hostel A",
    },
    {
      title: "DSLR Camera",
      price: "₹150/day",
      image: "/placeholder.svg?height=80&width=80",
      type: "rent",
      location: "Block C",
    },
  ]

  const stats = [
    { label: "Active Users", value: "12.5k", icon: "users" },
    { label: "Items Listed", value: "8.2k", icon: "package" },
    { label: "Successful Deals", value: "15.7k", icon: "check-circle" },
    { label: "Communities", value: "45", icon: "globe" },
  ]

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: "clamp",
  })

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: "clamp",
  })

  const QuickActionCard = ({ item, index }) => {
    const cardAnim = useRef(new Animated.Value(0)).current
    const scaleAnim = useRef(new Animated.Value(1)).current

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 200,
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

    return (
      <Animated.View
        style={[
          styles.quickActionCard,
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
          style={styles.quickActionButton}
          onPress={() => router.push(item.route)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <View style={styles.quickActionIconContainer}>
            <Feather name={item.icon} size={28} color={item.color} />
          </View>
          <Text style={styles.quickActionTitle}>{item.title}</Text>
          <Text style={styles.quickActionSubtitle}>{item.subtitle}</Text>
          <View style={styles.quickActionArrow}>
            <Feather name="arrow-right" size={16} color="#6B7280" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const CommunityCard = ({ item, index }) => {
    const cardAnim = useRef(new Animated.Value(0)).current
    const scaleAnim = useRef(new Animated.Value(1)).current

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start()
    }, [])

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start()
    }

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start()
    }

    return (
      <Animated.View
        style={[
          {
            opacity: cardAnim,
            transform: [
              { scale: scaleAnim },
              {
                translateX: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.communityCard}
          onPress={() => console.log(`Navigate to ${item.title}`)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <View style={styles.communityCardHeader}>
            <View style={styles.communityIconContainer}>
              <Feather name={item.icon} size={24} color="#111827" />
            </View>
            <View style={styles.communityCardInfo}>
              <View style={styles.communityTitleRow}>
                <Text style={styles.communityTitle}>{item.title}</Text>
                {item.trending && (
                  <View style={styles.trendingBadge}>
                    <Feather name="trending-up" size={12} color="#EF4444" />
                    <Text style={styles.trendingText}>Hot</Text>
                  </View>
                )}
              </View>
              <Text style={styles.communityDesc}>{item.desc}</Text>
              <View style={styles.communityStats}>
                <Feather name="users" size={12} color="#9CA3AF" />
                <Text style={styles.membersText}>{item.members} members</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#D1D5DB" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const FeaturedItem = ({ item, index }) => {
    const itemAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 150,
        useNativeDriver: true,
      }).start()
    }, [])

    return (
      <Animated.View
        style={[
          styles.featuredItem,
          {
            opacity: itemAnim,
            transform: [
              {
                translateY: itemAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity style={styles.featuredItemButton} activeOpacity={0.8}>
          <Image source={{ uri: item.image }} style={styles.featuredImage} />
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>{item.title}</Text>
            <Text style={styles.featuredPrice}>{item.price}</Text>
            <View style={styles.featuredLocation}>
              <Feather name="map-pin" size={10} color="#9CA3AF" />
              <Text style={styles.featuredLocationText}>{item.location}</Text>
            </View>
          </View>
          <View style={[styles.featuredTypeBadge, item.type === "sell" ? styles.sellBadge : styles.rentBadge]}>
            <Text style={[styles.featuredTypeText, item.type === "sell" ? styles.sellText : styles.rentText]}>
              {item.type === "sell" ? "SELL" : "RENT"}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const StatCard = ({ item, index }) => {
    const statAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
      Animated.timing(statAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start()
    }, [])

    return (
      <Animated.View
        style={[
          styles.statCard,
          {
            opacity: statAnim,
            transform: [
              {
                scale: statAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.statIconContainer}>
          <Feather name={item.icon} size={20} color="#111827" />
        </View>
        <Text style={styles.statValue}>{item.value}</Text>
        <Text style={styles.statLabel}>{item.label}</Text>
      </Animated.View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {/* Header Section */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslate }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.greetingContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.welcomeText}>Welcome to Xchange</Text>
            <Text style={styles.timeText}>
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((item, index) => (
              <QuickActionCard key={index} item={item} index={index} />
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Stats</Text>
          <View style={styles.statsContainer}>
            {stats.map((item, index) => (
              <StatCard key={index} item={item} index={index} />
            ))}
          </View>
        </View>

        {/* Featured Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Items</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
              <Feather name="arrow-right" size={14} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
            {featuredItems.map((item, index) => (
              <FeaturedItem key={index} item={item} index={index} />
            ))}
          </ScrollView>
        </View>

        {/* Communities Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore Communities</Text>
          <Text style={styles.sectionSubtitle}>Join communities and start exchanging</Text>
          <View style={styles.communitiesContainer}>
            {communityCards.map((item, index) => (
              <CommunityCard key={index} item={item} index={index} />
            ))}
          </View>
        </View>

        {/* Additional Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Features</Text>
          <View style={styles.featuresGrid}>
            <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
              <Feather name="bell" size={24} color="#111827" />
              <Text style={styles.featureTitle}>Notifications</Text>
              <Text style={styles.featureDesc}>Stay updated</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
              <Feather name="heart" size={24} color="#111827" />
              <Text style={styles.featureTitle}>Favorites</Text>
              <Text style={styles.featureDesc}>Saved items</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
              <Feather name="message-circle" size={24} color="#111827" />
              <Text style={styles.featureTitle}>Messages</Text>
              <Text style={styles.featureDesc}>Chat with sellers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
              <Feather name="settings" size={24} color="#111827" />
              <Text style={styles.featureTitle}>Settings</Text>
              <Text style={styles.featureDesc}>Customize app</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContainer: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  greetingContainer: {
    alignItems: "center",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginRight: 4,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionCard: {
    width: (width - 64) / 2,
  },
  quickActionButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  quickActionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 12,
  },
  quickActionArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: (width - 64) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  featuredScroll: {
    marginLeft: -24,
    paddingLeft: 24,
  },
  featuredItem: {
    width: 200,
    marginRight: 16,
  },
  featuredItemButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredImage: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginBottom: 12,
  },
  featuredContent: {
    marginBottom: 8,
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  featuredLocation: {
    flexDirection: "row",
    alignItems: "center",
  },
  featuredLocationText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  featuredTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  sellBadge: {
    backgroundColor: "#FEF3C7",
  },
  rentBadge: {
    backgroundColor: "#DBEAFE",
  },
  featuredTypeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  sellText: {
    color: "#D97706",
  },
  rentText: {
    color: "#2563EB",
  },
  communitiesContainer: {
    gap: 16,
  },
  communityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  communityCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  communityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  communityCardInfo: {
    flex: 1,
  },
  communityTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginRight: 8,
  },
  trendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendingText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#EF4444",
    marginLeft: 2,
  },
  communityDesc: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  communityStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  membersText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 4,
    fontWeight: "500",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: (width - 64) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginTop: 12,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  bottomSpacer: {
    height: 40,
  },
})

export default Home