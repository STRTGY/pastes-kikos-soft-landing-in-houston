# Consumer Behavior & Spending Datasets — Houston MSA Anglo Community

This directory contains datasets focused on the **Anglo-Saxon community (White alone, non-Hispanic)** in the Houston–The Woodlands–Sugar Land MSA (CBSA 26420), with emphasis on **food consumption patterns, spending, and market insights** for foodservice businesses.

## Datasets

### 1. `acs_profile_anglo_houston_2023.json`
**Source:** US Census Bureau — American Community Survey 2022 5-year estimates  
**Description:** Demographic profile of the Anglo-Saxon community in Houston MSA, with comparative data for Texas and United States.

**Key Metrics:**
- Population size and share by geography
- Age distribution (Anglo vs total MSA)
- Income (median household, family, per capita)
- Educational attainment (Bachelor's degree or higher)
- Employment characteristics (labor force participation, unemployment, remote work)
- Vehicle availability (none/1/2/3+ vehicles per household)
- Commute times

**Tables Used:** DP05, S1901, S2301, S0101, S0801

**Use Case:** Segmentation, target market sizing, demographic profiling for location and product strategy.

---

### 2. `ce_expenditures_houston_tx_us_2022_2024.json`
**Source:** Bureau of Labor Statistics — Consumer Expenditure Survey (CE)  
**Description:** Annual household expenditures by category, with detailed breakdown for Food at Home (FAH) vs Food Away from Home (FAFH).

**Geography Levels:**
- Houston MSA (Houston-The Woodlands-Sugar Land)
- South Region (proxy for Texas)
- United States

**Key Metrics:**
- Total expenditures per household
- Food at Home spending (groceries)
- Food Away from Home spending (restaurants, QSR, FSR)
- Share of FAFH as % of total food spending
- Year-over-year growth rates (2022-2023)
- Expenditure patterns by income tercile (national)

**Use Case:** Market sizing (TAM/SAM for FAFH), pricing benchmarks, understanding consumer budget allocation.

---

### 3. `cpi_food_houston_vs_us_2018_2025.json`
**Source:** Bureau of Labor Statistics — Consumer Price Index (CPI)  
**Description:** Food price indices for Houston MSA and United States, tracking inflation trends.

**Base Period:** 1982-84 = 100

**Series:**
- Food and beverages (total)
- Food at Home
- Food Away from Home

**Time Range:** 2018-2025 (annual), plus monthly data for 2024

**Key Metrics:**
- CPI index values by year and category
- Year-over-year % change
- Cumulative change 2018-2024
- Houston vs US comparison

**Use Case:** Pricing strategy, inflation impact analysis, cost pass-through decisions, margin pressure assessment.

---

### 4. `ers_food_expenditure_share_us_1997_2024.json`
**Source:** USDA Economic Research Service — Food Expenditure Series (FES)  
**Description:** Long-term trends in food spending allocation (FAH vs FAFH) at the national level, with demographic breakdowns.

**Key Metrics:**
- FAH share and FAFH share by year (1997-2024)
- Nominal spending in billions (FAH and FAFH)
- Trend analysis: pre-pandemic, pandemic (2020), recovery (2021-2024)
- Demographic patterns by:
  - Age of household head
  - Income quintile
  - Household size
- Regional estimates (Northeast, Midwest, South, West)

**Use Case:** Long-term secular trends, understanding COVID-19 impact on dining-out behavior, demographic targeting (e.g., younger households have higher FAFH share).

---

### 5. `ghp_houston_facts_context.json`
**Source:** Greater Houston Partnership — Houston Facts, US Census Bureau, BLS  
**Description:** Macro-level economic and demographic context for Houston MSA.

**Key Metrics:**
- Gross Metropolitan Product (GMP)
- Employment by industry
- Labor market statistics (unemployment, wages, remote work)
- Transportation infrastructure (vehicles per capita, commute times)
- Retail and foodservice market size ($billions)
- Cost of living indices
- Projections to 2030

**Use Case:** Competitive context, macro trends affecting consumer spending, location strategy (proximity to employment centers, vehicle-oriented planning).

---

## Data Quality & Methodology

### Geographic Coverage
All datasets focus on **Houston–The Woodlands–Sugar Land MSA (CBSA 26420)**, which includes 9 counties:
- Harris County (core)
- Fort Bend County
- Montgomery County
- Brazoria County
- Galveston County
- Liberty County
- Waller County
- Chambers County
- Austin County

### Racial/Ethnic Classification
- **"Anglo" or "Anglosajón"** refers to the Census category **"White alone, non-Hispanic"**
- Follows OMB (Office of Management and Budget) standards for racial/ethnic classification
- Distinct from "White alone" (which includes Hispanic White population)

### Time Periods
- **ACS data:** 2018-2022 5-year estimates (released 2023), labeled as "2022" or "2023"
- **CE data:** Annual averages for 2022 and 2023
- **CPI data:** Annual and monthly indices, 2018-2025 (2025 projected)
- **ERS data:** Historical series 1997-2024 (2024 estimated)
- **GHP data:** 2023-2024 estimates and 2030 projections

### Margins of Error
- ACS estimates are sample-based and have margins of error (MOE); consult ACS documentation for detailed MOE by table.
- CE and CPI data are also survey-based; BLS publishes standard errors for metro-area estimates.
- Use caution when comparing small differences across geographies or time periods.

### Inflation Adjustments
- **Nominal values:** All dollar amounts in CE, ERS, and GHP datasets are in nominal (current-year) dollars unless specified otherwise.
- Use CPI data to adjust for inflation if needed for multi-year comparisons.

---

## Usage in Observable Framework

All datasets are loaded in `src/pages/consumidor/demografia.md` using `FileAttachment`:

```js
const angloData = await FileAttachment("../../data/consumo/acs_profile_anglo_houston_2023.json").json();
const ceData = await FileAttachment("../../data/consumo/ce_expenditures_houston_tx_us_2022_2024.json").json();
const ersData = await FileAttachment("../../data/consumo/ers_food_expenditure_share_us_1997_2024.json").json();
const cpiData = await FileAttachment("../../data/consumo/cpi_food_houston_vs_us_2018_2025.json").json();
const ghpData = await FileAttachment("../../data/consumo/ghp_houston_facts_context.json").json();
```

These are then passed as props to components in `src/components/demografia/`:
- `AngloProfile.js` — uses `angloData`
- `ConsumptionSpending.js` — uses `ceData`, `ersData`
- `FoodInflation.js` — uses `cpiData`
- `VehicleMobility.js` — uses `angloData`, `ghpData`
- `MarketImplications.js` — uses all datasets for integrated analysis

---

## References & Links

- **ACS Data:** [data.census.gov/profile?g=310M200US26420](https://data.census.gov/profile?g=310M200US26420)
- **BLS CE Houston:** [bls.gov/regions/southwest/news-release/consumerexpenditures_houston.htm](https://www.bls.gov/regions/southwest/news-release/consumerexpenditures_houston.htm)
- **BLS CPI Houston:** [bls.gov/regions/southwest/news-release/consumerpriceindex_houston.htm](https://www.bls.gov/regions/southwest/news-release/consumerpriceindex_houston.htm)
- **USDA ERS FES:** [ers.usda.gov/data-products/food-expenditure-series/](https://www.ers.usda.gov/data-products/food-expenditure-series/)
- **Greater Houston Partnership:** [houston.org/houston-data](https://www.houston.org/houston-data)

---

## Update Schedule

- **ACS:** Annual release (September), using 5-year rolling estimates
- **CE:** Annual release (September), 1-2 years lag
- **CPI:** Monthly release (mid-month), annual averages calculated
- **ERS:** Annual update (Q2-Q3), historical revisions possible
- **GHP:** Quarterly/annual updates on website

**Last updated:** October 29, 2024

---

## Notes for Pastes Kikos Project

These datasets support strategic decision-making for the **Pastes Kikos soft landing in Houston**, specifically:

1. **Target Segmentation:** Anglo community with household income $75K-$150K+, ages 35-64, suburban (Fort Bend, Montgomery)
2. **Market Sizing:** Estimated $3.7B FAFH market among Anglo households in Houston MSA
3. **Pricing Strategy:** Ticket $9-$11 (competitive with Chipotle/Torchy's, premium to Taco Bell)
4. **Format:** Drive-thru essential (70%+ households have 2+ vehicles, high motorization culture)
5. **Location:** Proximity to employment corridors (I-10, US-290, Grand Pkwy) and affluent suburbs
6. **Competitive Positioning:** Authentic Mexican comfort food (pastes), differentiated from Tex-Mex chains and taquerías

See `MarketImplications.js` component for detailed strategic recommendations.

