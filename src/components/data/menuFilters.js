// Pure utility functions for filtering menu items data
// No FileAttachment, no reactive state

export function filterMenuItems({
  menuItems,
  selectedCategoryMenu,
  showOutliers,
  priceStats
}) {
  let filteredMenuData = menuItems.filter(d => d.price_amount != null);

  // Filter by category
  if (selectedCategoryMenu !== "all") {
    filteredMenuData = filteredMenuData.filter(d => d.category === selectedCategoryMenu);
  }

  // Filter outliers if disabled
  if (!showOutliers) {
    const stats = selectedCategoryMenu === "all"
      ? priceStats.overall
      : (priceStats.by_category || []).find(c => c.category === selectedCategoryMenu);
    if (stats) {
      const iqr = stats.p75 - stats.p25;
      const lower = stats.p25 - 1.5 * iqr;
      const upper = stats.p75 + 1.5 * iqr;
      filteredMenuData = filteredMenuData.filter(d => d.price_amount >= lower && d.price_amount <= upper);
    }
  }

  return filteredMenuData;
}

