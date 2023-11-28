import 'dotenv/config';

export default {
  "expo": {
    "name": "ChatPals",
    "slug": "nipunChatPals",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon1.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-screen11.jpg",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon1.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.nipunChatPals.ChatPals"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "79f4c245-63b4-4eeb-a262-22ad31cbf6f0"
      },
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,

    }
  }
}
