# Cookie Consent Implementation

This implementation provides a **GDPR-compliant** cookie consent solution for **web platforms only** with a non-intrusive design.

## 🌐 Web-Only Implementation

**Important**: Cookie consent is **only shown on web platforms**. Native mobile apps don't require cookie consent as they don't use web cookies.

## Features

- ✅ **GDPR fully compliant** with strict consent enforcement
- ✅ **Web-only** - No popup on native mobile apps
- ✅ **Comprehensive tracking cleanup** when cookies are declined
- ✅ Remembers user choice across sessions
- ✅ **Non-intrusive corner popup** - website remains fully usable
- ✅ **2.5 second delay** before showing (async loading)
- ✅ Desktop: Small rectangle in bottom-right corner
- ✅ Mobile web: Compact banner at bottom
- ✅ No black overlay or modal blocking
- ✅ Integrates with Google Analytics consent mode
- ✅ Bot-friendly (doesn't show for crawlers)
- ✅ **Immediate tracking disabling** when declined
- ✅ Beautiful, responsive design matching app theme

## 🛡️ GDPR Compliance Features

### When User **Accepts** Cookies:
- ✅ Enables Google Analytics and other tracking
- ✅ Sets consent mode to 'granted'
- ✅ Logs acceptance event

### When User **Declines** Cookies:
- 🚫 **Completely disables all tracking**
- 🧹 **Comprehensive cleanup** of existing tracking data:
  - Google Analytics cookies (all variants)
  - Facebook Pixel cookies
  - HubSpot, Hotjar, Intercom cookies
  - Google advertising cookies
  - localStorage/sessionStorage tracking data
  - IndexedDB tracking databases
- 🔒 Sets Google Analytics consent mode to 'denied'
- 📝 Logs decline event (minimal tracking)
- 🛡️ **Ensures no GDPR violation**

## Design Philosophy

**Non-Blocking UX + GDPR Compliance**: The cookie consent popup is informative but not disruptive. Users can continue using the website normally while making an informed choice about cookies.

### Desktop Design (Web Only)
- Small rectangle in bottom-right corner (max-width: 380px)
- Shows cookie icon, title, description with privacy policy link
- Two buttons: "Avvisa" and "Acceptera"
- Close button (×) = decline cookies
- Smooth slide-in animation from right

### Mobile Web Design  
- Compact banner at bottom of screen
- Shows cookie icon, title, and description
- Two buttons: "Avvisa" and "Acceptera"
- Close button (×) = decline cookies
- Smooth slide-in animation from bottom

## Timing Behavior

The popup appears **2.5 seconds after page load** if:
- Platform is **web** (not native app)
- User hasn't made a previous choice
- User is not a bot/crawler
- App has finished loading

## Platform Handling

```tsx
// Web platforms: Show cookie consent
if (Platform.OS === 'web') {
  // Cookie consent logic applies
}

// Native platforms: No cookie consent needed
if (Platform.OS !== 'web') {
  return null; // No web cookies = no consent needed
}
```

## How It Works

### Components

1. **CookieConsent.tsx** - Non-modal corner popup component (web-only)
2. **CookieConsentContext.tsx** - Global state with web-only logic
3. **CookieConsentWrapper.tsx** - Wrapper with delay and platform checks
4. **Storage utilities** - Persist consent choices
5. **Cookie utilities** - GDPR-compliant helper functions

### Integration

The cookie consent is automatically integrated into the root layout (`app/_layout.tsx`) but **only appears on web platforms** after the delay period.

### Usage in Components

```tsx
import { useCookieConsent } from '@/context/CookieConsentContext';
import { areCookiesAllowed } from '@/utils/cookieUtils';

// Use the hook to access consent state (web-only)
const { hasConsented, hasDeclined, acceptCookies, declineCookies } = useCookieConsent();

// Check if cookies are allowed before loading tracking scripts
const loadAnalytics = async () => {
  const allowed = await areCookiesAllowed(); // Returns false on native platforms
  if (allowed) {
    // Load your analytics scripts here (web-only)
  }
};
```

### GDPR-Compliant Storage Functions

```tsx
import { 
  setCookieConsent, 
  getCookieConsent, 
  hasCookieConsentBeenSet 
} from '@/utils/storage';

// Set consent (true = accept, false = decline)
await setCookieConsent(true);

// Get current consent data
const consent = await getCookieConsent();
// Returns: { accepted: boolean, timestamp: number, version: string } | null

// Check if user has made any decision
const hasDecided = await hasCookieConsentBeenSet();
```

### GDPR-Compliant Utility Functions

```tsx
import { 
  areCookiesAllowed, 
  cleanupTrackingData,
  loadTrackingScript,
  initializeConsentMode 
} from '@/utils/cookieUtils';

// Check if cookies are allowed (web-only, returns false on native)
const allowed = await areCookiesAllowed();

// Load a tracking script only if consent given (web-only)
const loaded = await loadTrackingScript('https://example.com/script.js', 'unique-id');

// Comprehensive tracking data cleanup (automatically called on decline)
cleanupTrackingData();

// Initialize Google Analytics consent mode (web-only)
await initializeConsentMode();
```

## 🛡️ GDPR Compliance Deep Dive

### Legal Requirements Met:
- ✅ **Informed consent**: Clear explanation of cookie usage
- ✅ **Freely given**: Equal prominence of accept/decline buttons
- ✅ **Specific consent**: User must actively choose
- ✅ **Revocable consent**: Easy to change via close button
- ✅ **No pre-ticked boxes**: No default acceptance
- ✅ **Granular control**: Links to cookie policy for details
- ✅ **Data minimization**: Only essential cookies without consent
- ✅ **Right to erasure**: Comprehensive cleanup when declined

### Technical Implementation:
- 🔒 **Immediate blocking**: No tracking until consent given
- 🧹 **Complete cleanup**: All tracking data removed when declined
- 📝 **Consent logging**: Timestamped consent records
- 🔄 **State persistence**: Remembers choice across sessions
- 🤖 **Bot handling**: Doesn't interfere with SEO crawlers

## Testing

To test GDPR compliance:

1. **First Visit**: Clear storage to simulate first-time user
2. **Web Only**: Verify popup only appears on web, not native apps
3. **Delay**: Verify popup appears after 2.5 seconds, not immediately
4. **Accept Flow**: Accept cookies and verify tracking is enabled
5. **Decline Flow**: Decline cookies and verify:
   - All tracking is disabled
   - Existing tracking data is cleaned up
   - No new tracking cookies are set
   - Console shows cleanup messages
6. **Persistence**: Restart and verify choice is remembered
7. **Bot Detection**: Test with bot user agents (shouldn't show)
8. **Non-Blocking**: Verify website remains fully usable

### GDPR Testing Commands

```tsx
import { clearCookieConsent } from '@/utils/storage';
import { cleanupTrackingData, areCookiesAllowed } from '@/utils/cookieUtils';

// Clear consent for testing
await clearCookieConsent();

// Manually test cleanup
cleanupTrackingData();

// Check current consent status
const allowed = await areCookiesAllowed();
console.log('Cookies allowed:', allowed);
```

### Browser Developer Tools Testing

1. **Before consent**: Check Application > Cookies (should be minimal)
2. **Accept cookies**: Verify tracking cookies appear
3. **Decline cookies**: Verify all tracking cookies are removed
4. **Storage cleanup**: Check localStorage/sessionStorage is cleaned

## Google Analytics Integration

Fully integrated with Google Analytics Consent Mode:

- **Default state**: All storage denied until consent
- **Accept**: All storage types granted, tracking enabled
- **Decline**: All storage types denied, existing data cleaned
- **Logging**: Consent events tracked for compliance

## Performance Impact

- **Zero impact on native apps**: No cookie logic runs
- **Minimal web impact**: Small component with efficient animations
- **Async loading**: Doesn't block initial page render
- **Conditional rendering**: Only loads when needed
- **Memory efficient**: Proper cleanup of timers and animations

## Browser Support

Works on all modern browsers that support:
- React Native Web
- Local Storage / AsyncStorage
- CSS positioning and animations
- Modern JavaScript features
- Cookie manipulation APIs
- IndexedDB (for cleanup)

## Legal Disclaimer

This implementation follows GDPR best practices but you should:
- ✅ Review with legal counsel
- ✅ Update privacy policy to match implementation
- ✅ Ensure cookie policy page exists at `/cookiepolicy`
- ✅ Consider additional regulations (CCPA, etc.)
- ✅ Test thoroughly in your specific use case 