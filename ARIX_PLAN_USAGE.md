# ArixPlan Feature Documentation

## Overview
The ArixPlan feature fetches trading plan recommendations from Google Sheets with 1-hour caching. It provides comprehensive analysis of buy/sell targets, stop loss levels, and return/risk ratios.

## API Endpoint
```
https://sheets.googleapis.com/v4/spreadsheets/1ekb2bYAQJZbtmqMUzsagb4uWBdtkAzTq3kuIMHQ22RI/values/ArixPlan?key=AIzaSyB9PPBCGbWFv1TxH_8s_AsiqiChLs9MqXU
```

## Data Structure

### Google Sheets Format
| symbol | buyPrice | stopLoss | target | returnRisk |
|--------|----------|----------|--------|------------|
| MSN    | 85000    | 83600    | 94600  | 7          |
| TRC    | 70500    | 68800    | 76200  | 3,353      |
| GMD    | 69000    | 63400    | 78000  | 1,607      |

## Files Created

### 1. Types (`src/types/arix-plan.ts`)
```typescript
export interface ArixPlanPosition {
  symbol: string;       // Stock symbol
  buyPrice: number;     // Recommended buy price
  stopLoss: number;     // Stop loss price
  target: number;       // Target price
  returnRisk: number;   // Return/Risk ratio
}

export interface ArixPlanResponse {
  positions: ArixPlanPosition[];
  totalPositions: number;
  lastUpdated: string;
}
```

### 2. Schema (`src/lib/schemas/arix-plan.schema.ts`)
Zod schemas for validation:
- `googleSheetsResponseSchema` - Validates API response
- `arixPlanPositionSchema` - Validates position data

### 3. Service (`src/services/arix-plan.service.ts`)
Methods available:
- `getArixPlanPositions()` - Fetch all positions
- `getPositionStatistics()` - Calculate statistics and analytics
- `getPositionBySymbol(symbol)` - Get specific symbol's plan
- `getPositionsByReturnRisk()` - Sort by return/risk ratio
- `getPositionsByPotentialReturn()` - Sort by potential return %
- `getRiskRewardAnalysis()` - Detailed risk/reward metrics

### 4. Hooks (`src/hooks/use-arix-plan.ts`)
Six React Query hooks with **1-hour cache**:

#### `useArixPlanPositions(enabled?)`
Fetch all trading plan positions.

```typescript
import { useArixPlanPositions } from '@/hooks/use-arix-plan';

function MyComponent() {
  const { data, isLoading, error } = useArixPlanPositions();
  
  return (
    <div>
      {data?.positions.map(pos => (
        <div key={pos.symbol}>
          {pos.symbol}: Buy at {pos.buyPrice}
        </div>
      ))}
    </div>
  );
}
```

#### `useArixPlanStatistics(enabled?)`
Get comprehensive statistics and analytics.

```typescript
const { data: stats } = useArixPlanStatistics();

// Available data:
// - stats.totalPositions
// - stats.avgBuyPrice
// - stats.avgTarget
// - stats.avgReturnRisk
// - stats.positionsWithReturns
// - stats.topOpportunities (top 5 by return/risk)
```

#### `useArixPlanPositionBySymbol(symbol, enabled?)`
Get trading plan for a specific stock symbol.

```typescript
const { data: plan } = useArixPlanPositionBySymbol('MSN');

if (plan) {
  console.log(`Buy: ${plan.buyPrice}, Target: ${plan.target}`);
}
```

#### `useArixPlanPositionsByReturnRisk(enabled?)`
Get positions sorted by return/risk ratio (best opportunities first).

```typescript
const { data: sortedPositions } = useArixPlanPositionsByReturnRisk();
```

#### `useArixPlanPositionsByPotentialReturn(enabled?)`
Get positions sorted by potential return percentage.

```typescript
const { data: highReturns } = useArixPlanPositionsByPotentialReturn();
```

#### `useArixPlanRiskRewardAnalysis(enabled?)`
Get detailed risk/reward analysis for all positions.

```typescript
const { data: analysis } = useArixPlanRiskRewardAnalysis();

// Returns array with:
// - potentialGain / potentialLoss
// - riskRewardRatio
// - potentialGainPercent / potentialLossPercent
```

### 5. Components

#### `AriXHubPlanTable`
Displays trading plans in a comprehensive table with:
- Stock symbol
- Buy price, stop loss, target
- Potential returns and risks (both amount and %)
- Return/Risk ratio badge
- Rating (Good/Medium/Cautious)

#### `AriXHubPlanChart`
Interactive D3 bubble chart showing:
- Bubble size represents return/risk ratio
- Color coding:
  - 🟢 Green: R/R ≥ 5 (Good opportunities)
  - 🟡 Yellow: R/R ≥ 3 (Medium)
  - 🟠 Orange: R/R < 3 (Cautious)
- Draggable bubbles
- Shows symbol, R/R ratio, and potential return %

#### `AriXHubPlan`
Main component combining:
- Statistics cards (Total plans, Avg buy price, Avg target, Avg R/R)
- Tabs for table and chart views
- Top 5 opportunities section

## Integration

The ArixPlan feature has been integrated into the AriX Hub page with three main tabs:
1. **Nắm giữ (Hold)** - Current holdings
2. **Kế hoạch (Plan)** - Trading plans ⭐ NEW
3. **Lịch sử (Sell)** - Historical trades

Access at: `/arix-hub` page, "Kế hoạch" tab

## Caching Strategy

All hooks use:
- `staleTime: 60 * 60 * 1000` (60 minutes)
- `gcTime: 60 * 60 * 1000` (60 minutes)
- `refetchOnWindowFocus: false`
- `refetchOnMount: false`

This means:
- ✅ Data is cached for 1 hour
- ✅ No unnecessary refetches
- ✅ Minimal API calls
- ✅ Fast user experience

## Example: Using in a Custom Component

```typescript
import { useArixPlanPositions, useArixPlanStatistics } from '@/hooks/use-arix-plan';
import { Card } from '@/components/ui/card';

export function MyTradingPlanWidget() {
  const { data: plans, isLoading } = useArixPlanPositions();
  const { data: stats } = useArixPlanStatistics();
  
  if (isLoading) return <div>Loading...</div>;
  
  // Get top 3 opportunities
  const topPlans = stats?.topOpportunities.slice(0, 3);
  
  return (
    <Card>
      <h3>Top Trading Opportunities</h3>
      <div>Total Plans: {stats?.totalPositions}</div>
      <div>Avg Return/Risk: {stats?.avgReturnRisk.toFixed(2)}</div>
      
      {topPlans?.map(plan => {
        const returnPercent = ((plan.target - plan.buyPrice) / plan.buyPrice) * 100;
        return (
          <div key={plan.symbol}>
            <strong>{plan.symbol}</strong>
            <div>Buy: {plan.buyPrice} → Target: {plan.target}</div>
            <div>Potential: +{returnPercent.toFixed(2)}%</div>
            <div>R/R: {plan.returnRisk}</div>
          </div>
        );
      })}
    </Card>
  );
}
```

## Features

✅ **1-hour caching** - Efficient data management  
✅ **Comprehensive statistics** - Full analytics suite  
✅ **Interactive visualizations** - D3 bubble charts  
✅ **Responsive tables** - Mobile-friendly design  
✅ **Type-safe** - Full TypeScript support  
✅ **Error handling** - Graceful fallbacks  
✅ **Loading states** - Smooth UX  
✅ **Number formatting** - Vietnamese locale support  

## Color Coding Guide

### Risk/Reward Ratings:
- 🟢 **Good** (R/R ≥ 5): High potential returns relative to risk
- 🟡 **Medium** (R/R ≥ 3): Balanced risk/reward
- 🟠 **Cautious** (R/R < 3): Higher risk relative to potential returns

### Percentage Display:
- 🟢 Green: Potential gains (target price)
- 🔴 Red: Potential losses (stop loss)

## Notes

1. Numbers with commas (e.g., "3,353") are automatically parsed correctly
2. All prices are displayed in Vietnamese format with thousand separators
3. The service includes comprehensive error handling and validation
4. Data is automatically refreshed after 1 hour
5. The component gracefully handles loading and error states

