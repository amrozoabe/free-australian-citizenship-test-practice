export default {
    expo: {
      name: "Australian Citizenship Test Practice",
      slug: "australian-citizenship-test-practice",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/icon.png",
      userInterfaceStyle: "light",
      splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      },
      assetBundlePatterns: ["**/*"],
      ios: {
        supportsTablet: true
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#ffffff"
        }
      },
      extra: {
        eas: {
          projectId: "your-project-id"
        }
      },
      sdkVersion: "52.0.0"
    }
  };