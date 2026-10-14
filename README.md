# શ્રી નાડોદા રાજપૂત સમાજ - પબ્લિક પોર્ટલ (Nadoda Rajput Public Portal)

A dedicated, lightweight, mobile-first public portal for the **Nadoda Rajput Community**.
Designed specifically for mobile phones with app-like navigation, fast search, direct Call/WhatsApp actions, and zero login barrier.

---

## 🌟 Features (મુખ્ય સુવિધાઓ)

1. **🔐 No Login Required (કોઈ લોગિન વગર સીધો પ્રવેશ)**:
   - Designed for the public community to easily view records without credentials or sign-up hassle.

2. **🌳 વંશાવળી (Hierarchy / Family Tree)**:
   - Interactive generational tree view for all families in the village.
   - Expand/collapse family branches.
   - House numbers, Head of Family badge, and direct tap to view full profile.

3. **📖 સમાજ ડિરેક્ટરી (Members Directory)**:
   - Real-time debounced search by Name, Mobile Number, Atak, House Number, or City.
   - Instant filtering by Gender (👨 પુરુષ / 👩 સ્ત્રી) and Atak pills.
   - One-tap direct **Phone Call (`tel:`)** and **WhatsApp** action buttons for instant mobile communication.

4. **📊 સમાજ ગણતરી અને આંકડા (Community Stats)**:
   - Overview metrics: Total Families, Total Population, Male/Female count, and Sex Ratio.
   - Visual distribution bars for Age Groups, Top Ataks, Education, and Professions.

5. **🏛️ ગામ પસંદગી (Village Switcher)**:
   - Header dropdown to easily switch between villages (e.g., Baspa, Mandvi, etc.) with instant synchronization across all tabs.

6. **📱 Mobile-First Native App Experience**:
   - Fixed top header with verified Rajput emblem (`nododa_rajput.png`).
   - Sticky bottom navigation bar with haptic touch feedback.
   - Smooth slide-up bottom sheets for member details.

---

## 🚀 Getting Started

### Development
```bash
cd nadoda-rajput-public-portal
npm install
npm run dev
```
Open [http://localhost:5175](http://localhost:5175) in your mobile browser or desktop browser in responsive mobile mode.

### Production Build
```bash
npm run build
```
Creates an optimized production bundle in `dist/`.
