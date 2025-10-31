# User Guide – Industry Evaluation Dashboard Navigation

## Quick Start

### Accessing the Dashboard
1. Navigate to `/pages/industria/evaluation` in your Observable Framework app
2. The dashboard loads with default view showing all restaurants in Houston

---

## 🧭 Navigation Features

### 1. Tabs
Located at the top of the dashboard:
- **Overview**: See all visualizations at once
- **Categories**: Focus on restaurant categories (coming soon)
- **Prices**: Focus on price distribution (coming soon)
- **Reviews**: Focus on reviews and ratings (coming soon)
- **Hours**: Focus on opening hours patterns (coming soon)

**Pro Tip**: Current tab is saved in the URL - bookmark specific views!

### 2. KPI Band
Shows real-time metrics:
- **Total Restaurants**: All restaurants in the dataset
- **In Selection**: How many match your current filters
- **Hours Coverage**: Percentage with opening hours data
- **Avg Rating**: Average rating of filtered restaurants

**Updates automatically** as you filter!

### 3. Filter Panel (Left Side)
Click the panel header to collapse/expand.

**Available Filters**:
- **Category**: Multi-select with search box (type to filter categories)
- **Price**: Multi-select ($, $$, $$$, $$$$)
- **Min. Rating**: Minimum star rating (0-5)
- **Min. Reviews**: Minimum number of reviews
- **Drive-Thru Only**: Checkbox for drive-thru restaurants
- **Open Now**: Checkbox for currently open restaurants

**Buttons**:
- **Reset**: Clear all filters
- **Share**: Copy URL with current filters to clipboard

### 4. Filter Chips (Below KPIs)
Shows active filters as removable chips:
- Click **×** on any chip to remove that filter
- Click **Clear All** to remove all filters at once
- Empty state shows "No active filters"

---

## 📊 Chart Interactions

### Category Chart (Top Right)
- Shows top 10 restaurant categories
- **Click any bar** to open a ranked list of restaurants in that category
- Hover for exact counts

### Price Distribution (Middle Right)
- Shows count of restaurants by price range
- Red line shows cumulative distribution
- Click coming soon!

### Star Distribution (Bottom Left)
- Shows count of restaurants by star rating (1-5)
- Click coming soon!

### Opening Hours Heatmap (Bottom Right)
- Shows aggregated patterns across all restaurants with hours data
- Darker blue = more activity
- Rows = days of week, Columns = hours of day (00-23)
- Hover for exact intensity values

---

## 🗺️ Map Interactions

### Map Controls (Top Right of Map)
- **⟲ Reset View**: Fit all restaurants in view
- **⬡ Toggle Clusters**: Show/hide point clustering
- **▦ Toggle Density**: Show/hide density heatmap layer

### Map Features
- **Clusters**: Large circles show count of nearby restaurants
- **Individual Points**: Color-coded by category
- **Hover**: See restaurant name, category, price, rating, reviews
- **Click cluster**: Zoom in to expand

---

## 📋 Restaurant List Drawer

### Opening the Drawer
- Click any category bar in the chart
- More chart interactions coming soon!

### Drawer Features
- **Sort dropdown**: Rating (default), Reviews, Distance, Name
- **CSV button**: Export filtered list to CSV file
- **Click restaurant**: Map zooms to that location
- **Close**: Click **×** or click outside drawer

### List View
- Shows name, category, price, rating, review count
- Scrollable list
- Hover highlights

---

## 🔗 Sharing & Deep Linking

### How to Share
1. Set up your filters and tab
2. Click **Share Link** in filter panel
3. Paste URL to share exact view

### URL Format
```
https://yoursite.com/industria/evaluation#tab=overview&cat=Mexicana,BBQ&price=$$&rating=4&open=1
```

### URL Parameters
- `tab`: Current tab (overview, categories, prices, reviews, hours)
- `cat`: Selected categories (comma-separated)
- `price`: Selected price ranges (comma-separated)
- `rating`: Minimum rating
- `reviews`: Minimum reviews
- `dt`: Drive-thru only (1 = yes)
- `open`: Open now (1 = yes)

---

## ⌨️ Keyboard Shortcuts

### Filter Panel
- **Tab**: Navigate between filter inputs
- **Space**: Toggle checkboxes
- **Enter**: Confirm selection in dropdowns

### Drawer
- **Esc**: Close drawer (coming soon)
- **Tab**: Navigate list items

---

## 💡 Pro Tips

### Finding Specific Restaurants
1. Use **Category search** to quickly find the type you want
2. Set **Min. Rating** to filter quality
3. Set **Min. Reviews** to ensure reliability
4. Click **Open Now** for immediate options

### Comparing Categories
1. Select multiple categories
2. Compare in charts
3. Click individual category bars to see detailed lists

### Exporting Data
1. Apply your filters
2. Click category bar (or use filters to get full set)
3. In drawer, click **CSV** button
4. Opens spreadsheet with: Name, Category, Price, Rating, Reviews

### Performance
- Dashboard caches filter combinations for speed
- Charts auto-resize when you change window size
- All updates debounced for smooth experience

---

## 🐛 Troubleshooting

### Filters Not Working?
- Check if any other filters are too restrictive
- Try **Reset Filters** and start over
- Verify data loaded (check KPI band shows restaurants)

### Drawer Not Opening?
- Ensure you clicked directly on a chart bar
- Check browser console for errors (F12)

### Charts Not Visible?
- Try refreshing the page
- Check your zoom level (charts need minimum width)
- Verify JavaScript is enabled

### Share Link Not Working?
- Browser must support Clipboard API
- Try manually copying URL from address bar
- Check for browser security settings blocking clipboard

---

## 🆘 Support

### Report Issues
- Check console (F12) for error messages
- Note the URL (including hash parameters)
- Describe steps to reproduce

### Feature Requests
Coming soon:
- Brushable price histogram
- Lasso selection on map
- Hours tab with weekday breakdown
- Onboarding tips
- Language toggle (ES/EN)

---

**Last Updated**: 2025-01-30  
**Version**: 1.0 (Phase 1 Complete)

