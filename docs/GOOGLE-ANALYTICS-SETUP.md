# 📊 Google Analytics 4 Setup Guide for Bilregistret

## 🎯 **Step 1: Get Your GA4 Tracking ID**

### **Find Your Measurement ID:**

1. **Go to Google Analytics:** https://analytics.google.com
2. **Create a new property** (if you don't have one):
   - Click **"Create"** → **"Property"**
   - Property name: `Bilregistret Sverige AB`
   - Country: `Sweden`
   - Currency: `Swedish Krona (SEK)`
   - Industry: `Automotive`

3. **Add a Web Data Stream:**
   - Click **"Data Streams"** → **"Add stream"** → **"Web"**
   - Website URL: `https://bilregistret.ai`
   - Stream name: `Bilregistret Web App`
   - ✅ **Enhanced measurement** (enable all options)

4. **Copy your Measurement ID:**
   - Format looks like: `G-ABC123DEF4`
   - You'll see it in the top-right of the stream details

---

## 🔧 **Step 2: Add Environment Variables**

Create or update your `.env` file:

```bash
# 📊 Google Analytics 4 Configuration
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YOUR_ACTUAL_ID_HERE
EXPO_PUBLIC_GA_MEASUREMENT_ID=G-YOUR_ACTUAL_ID_HERE

# 🎭 SEO Configuration  
NEXT_PUBLIC_SITE_URL=https://bilregistret.ai
NEXT_PUBLIC_ENABLE_SEO_DEBUG=true
```

**Replace `G-YOUR_ACTUAL_ID_HERE` with your real GA4 Measurement ID!**

---

## 🌍 **Step 3: Add to Your Root Layout**

### **Option 1: Expo Router (_layout.tsx)**
```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';
import GlobalSEOProvider from '@/components/common/GlobalSEOProvider';

export default function RootLayout() {
  return (
    <GlobalSEOProvider 
      enableAnalytics={true}
      enableWebVitals={true}
      debugMode={__DEV__} // Enable debug in development
    >
      <Stack>
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
        {/* Your other screens */}
      </Stack>
    </GlobalSEOProvider>
  );
}
```

### **Option 2: Next.js (_app.tsx)**
```tsx
// pages/_app.tsx or app/layout.tsx
import GlobalSEOProvider from '@/components/common/GlobalSEOProvider';

export default function App({ Component, pageProps }) {
  return (
    <GlobalSEOProvider 
      enableAnalytics={true}
      enableWebVitals={true}
      debugMode={process.env.NODE_ENV === 'development'}
    >
      <Component {...pageProps} />
    </GlobalSEOProvider>
  );
}
```

---

## 🧪 **Step 4: Test Your Setup**

### **1. Check Browser Console (Development)**
Open browser DevTools → Console, you should see:
```
📊 Initializing Google Analytics 4 with Google Tag...
✅ Google Tag loaded successfully
🎭 Google Analytics 4 initialized with magical SEO tracking!
📊 Magical Core Web Vitals: {metric: "LCP", value: 2300, grade: "🟢 Excellent"}
```

### **2. Check Network Tab**
In DevTools → Network, look for:
- `gtag/js?id=G-YOUR_ID` - Google Tag loading
- `collect?v=2` - GA4 data being sent

### **3. Use GA4 DebugView (Real-time)**
1. **Enable Debug Mode:**
   ```tsx
   <GlobalSEOProvider debugMode={true} />
   ```

2. **Go to GA4 DebugView:**
   - Google Analytics → Configure → DebugView
   - You should see real-time events coming in

3. **Look for these events:**
   - `page_view` - Page loads
   - `magical_web_vitals` - Performance metrics
   - `category_interaction` - User clicks

### **4. Chrome Extension Test**
Install **"Google Analytics Debugger"** Chrome extension:
- Enable it on your site
- Check console for detailed GA tracking logs

---

## 📊 **Step 5: Monitor Your Data**

### **Real-time Reports (Immediate)**
1. **Google Analytics → Reports → Realtime**
2. **Open your website** in another tab
3. **You should see:**
   - Active users: 1+
   - Page views incoming
   - Events being tracked

### **Standard Reports (24-48 hours)**
1. **Audience → Overview** - User demographics
2. **Behavior → Events** - Custom events like `magical_web_vitals`
3. **Acquisition → Traffic** - How users find your site

---

## 🎭 **Step 6: Verify Magical SEO Events**

Your magical SEO system automatically tracks:

### **Core Web Vitals Events:**
```javascript
// Event: magical_web_vitals
{
  event_category: "Performance Magic",
  metric_name: "LCP",
  metric_value: 2300,
  performance_grade: "🟢 Excellent",
  device_type: "desktop",
  page_path: "/biluppgifter"
}
```

### **User Interaction Events:**
```javascript
// Event: category_interaction  
{
  event_category: "User Engagement",
  event_label: "Biluppgifter",
  value: 1
}
```

### **Page Performance Events:**
```javascript
// Event: page_performance_score
{
  event_category: "SEO Magic", 
  overall_score: 95,
  lcp_grade: "excellent",
  page_path: "/tillverkare"
}
```

---

## 🔧 **Troubleshooting**

### **❌ "Google Tag not loading"**
**Check:**
- Your Measurement ID is correct
- No ad blockers blocking Google Analytics
- Network connectivity

### **❌ "No events in GA4"**
**Check:**
- Debug mode is enabled: `debugMode={true}`
- Check browser console for errors
- Verify your GA4 property is set up correctly

### **❌ "Events not appearing in reports"**
**Wait:** Standard reports take 24-48 hours
**Use:** Realtime reports for immediate verification

### **🔍 Debug Command:**
```javascript
// Run in browser console to check GA status
// console.log('GA4 Status:', {
  gaLoaded: !!window.gtag,
  dataLayer: window.dataLayer?.length || 0,
  measurementId: 'G-YOUR_ID'
});
```

---

## 🎯 **Custom Events (Optional)**

You can also track custom events:

```tsx
// In any component
const trackCustomEvent = () => {
  if (window.gtag) {
    window.gtag('event', 'bil_search', {
      event_category: 'Search',
      event_label: 'registreringsnummer',
      value: 1
    });
  }
};
```

---

## 🚀 **Next Steps**

Once GA4 is working:

1. **Set up Conversion Goals** (form submissions, searches)
2. **Create Custom Dashboards** for Core Web Vitals
3. **Set up Alerts** for performance issues
4. **Link to Google Search Console** for full SEO tracking

Your magical SEO system is now tracking **everything automatically**! 🎭✨ 