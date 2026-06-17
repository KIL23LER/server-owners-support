---
name: Mobile OAuth deep link flow
description: How Discord OAuth works for the Expo mobile app
---

## Flow
1. Mobile opens `GET /api/auth/login?mobile=true&redirect=sos-website-mobile://auth`
2. Backend encodes mobile+redirect in Discord OAuth `state` param
3. Callback reads state, builds deep link: `sos-website-mobile://auth?session=TOKEN`
4. Expo app handles this via expo-linking in _layout.tsx DeepLinkHandler
5. Token stored in AsyncStorage, wired to API client via setAuthTokenGetter

**Why:** Discord OAuth requires a web redirect URI registered in the Discord app dashboard.
**How to apply:** The DISCORD_REDIRECT_URI must always point to the API server (Vercel). The mobile app gets the token via deep link, not directly from Discord.
