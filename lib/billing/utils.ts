import { getCurrentTier } from "~/lib/utils";
import { MAX_PAGES_SUBSCRIPTION } from '~/lib/constants';
import { z } from "zod";
import { LineItemSchema, ProductSchema, TierSchema } from "~/lib/schemas/create-billing-schema";

export const validatePageCount = (value: number, lastValidValue: number) => {
  // If we're in the forbidden range (5-50)
  if (value > 5 && value < 50) {
    // Stick to the last valid value
    return lastValidValue;
  }
  
  // Outside forbidden range - clamp to valid ranges
  return Math.min(Math.max(5, value), MAX_PAGES_SUBSCRIPTION);
};

export const valueToSliderPosition = (value: number) => {
  return Math.log(value / 5) / Math.log(MAX_PAGES_SUBSCRIPTION / 5);
};

export const sliderPositionToValue = (position: number) => {
  return Math.round(5 * Math.pow(MAX_PAGES_SUBSCRIPTION / 5, position));
};

export function calculateTieredCost(pageCountValue: number, tiers: {
    cost: number;
    upTo: number | "unlimited";
}[]) {

    const tiersUpTo = tiers.map((tier) => tier.upTo)

    // Convert pageCount to a number, defaulting to 0 if it's not a valid number
    const pageCount = Number(pageCountValue) ?? 0;

    const index = getCurrentTier(pageCount, tiersUpTo);
    
    const cost = tiers[index]?.cost ?? 0; 

    // Apply the cost of the applicable tier to all pages
    const costPerPage = Number(cost);
    return costPerPage * pageCount
}

export function isActiveTier(
  currentPages: number,
  currentTierIndex: number,
  tiers: z.infer<typeof LineItemSchema>['tiers']
): boolean {

  if(!tiers) return false

  const tiersUpTo = tiers.map((tier) => tier.upTo)
  const index = getCurrentTier(currentPages, tiersUpTo)
  
  return index === currentTierIndex
}

interface StandardizedTier {
  cost: number;
  upTo: number | "unlimited";
}

function convertLineItemToTiers(lineItem: z.infer<typeof LineItemSchema>): StandardizedTier[] {
  // If item already has tiers, return them
  if (lineItem.tiers && lineItem.tiers.length > 0) {
    return lineItem.tiers;
  }

  // For flat rate or per_seat items, create a single tier
  if (lineItem.type === 'flat' || lineItem.type === 'per_seat') {
    return [{
      cost: lineItem.cost,
      upTo: 'unlimited'
    }];
  }

  // For custom plans, create a single unlimited tier with cost 0
  if (lineItem.type === 'metered') {
    return [{
      cost: 0,
      upTo: 'unlimited'
    }];
  }

  // Default fallback tier
  return [{
    cost: 0,
    upTo: 'unlimited'
  }];
}

export function getBillingInfoForPageCount(products: z.infer<typeof ProductSchema>[], pageCount: number, selectedInterval?: string) {
  const product = products.find(p => p.name === determinePlan(pageCount));
  
  if (!product) return { product: undefined, plan: undefined, tier: undefined, index: -1 };

  const plan = product.plans.find(p => p.interval === selectedInterval);
  if (!plan?.lineItems?.length || !plan.lineItems[0]) return { product, plan: undefined, tier: undefined, index: -1 };

  const primaryLineItem = plan.lineItems[0];
  const tiers = convertLineItemToTiers(primaryLineItem);
  
  let tierIndex = -1;
  const tier = tiers.find((t, index) => {
    if (t.upTo === 'unlimited' || pageCount <= t.upTo) {
      tierIndex = index;
      return true;
    }
    return false;
  });

  return {
    product,
    plan,
    tier,
    index: tierIndex
  };
}

export function getTierText(tier: z.infer<typeof TierSchema>, unit?: string) {
  // Format number to always show 2 decimal places
  const formattedCost = tier.cost.toFixed(2);
  return `$${formattedCost} / ${unit ?? 'units'}`;
}

// Function to determine the plan based on page count
export const determinePlan = (pages: number) => {
  if (pages <= 5) return 'Free';
  if (pages !== MAX_PAGES_SUBSCRIPTION) return 'Pro';
  return 'Business';
};