/**
 * Smart Product Recommendation Service
 * Recommends marketplace products based on farmer's crop, season, and purchase history
 */
import Product from "../DB/Product.js";
import Order from "../DB/Order.js";

// Crop → relevant product categories and keywords
const CROP_PRODUCT_MAP = {
  Rice:      { categories: ['Seed', 'Fertilizer'], keywords: ['rice', 'paddy', 'urea', 'dap', 'irrigation', 'spray pump'] },
  Wheat:     { categories: ['Seed', 'Fertilizer'], keywords: ['wheat', 'urea', 'potash', 'fungicide', 'seed drill'] },
  Cotton:    { categories: ['Seed', 'Fertilizer', 'Other'], keywords: ['cotton', 'bt cotton', 'drip', 'pesticide', 'bollworm'] },
  Maize:     { categories: ['Seed', 'Fertilizer'], keywords: ['maize', 'corn', 'hybrid seed', 'npk', 'irrigation'] },
  Sugarcane: { categories: ['Seed', 'Fertilizer', 'Machinery'], keywords: ['sugarcane', 'ratoon', 'drip irrigation', 'nitrogen'] },
  Soybean:   { categories: ['Seed', 'Fertilizer'], keywords: ['soybean', 'rhizobium', 'phosphorus', 'herbicide'] },
  Tomato:    { categories: ['Seed', 'Fertilizer', 'Other'], keywords: ['tomato', 'drip', 'calcium', 'fungicide', 'trellis'] },
  Groundnut: { categories: ['Seed', 'Fertilizer'], keywords: ['groundnut', 'peanut', 'gypsum', 'calcium', 'bore well'] },
  Onion:     { categories: ['Seed', 'Fertilizer'], keywords: ['onion', 'phosphorus', 'potash', 'cold storage'] },
  Potato:    { categories: ['Seed', 'Fertilizer', 'Machinery'], keywords: ['potato', 'seed potato', 'ridger', 'pesticide'] },
  Chickpea:  { categories: ['Seed', 'Fertilizer'], keywords: ['chickpea', 'gram', 'rhizobium', 'phosphorus'] },
  Mustard:   { categories: ['Seed', 'Fertilizer'], keywords: ['mustard', 'sulphur', 'boron', 'dap'] },
  General:   { categories: ['Seed', 'Fertilizer', 'Machinery', 'Other'], keywords: ['organic', 'compost', 'spray pump', 'tools'] },
};

/**
 * Score products based on crop relevance
 */
function scoreProduct(product, crop) {
  const mapping = CROP_PRODUCT_MAP[crop] || CROP_PRODUCT_MAP.General;
  let score = 0;
  
  // Category match
  if (mapping.categories.includes(product.category)) score += 40;
  
  // Keyword match in product name or description
  const productText = `${product.name} ${product.description || ''}`.toLowerCase();
  for (const kw of mapping.keywords) {
    if (productText.includes(kw.toLowerCase())) score += 20;
  }

  // In-stock bonus
  if (product.quantity > 0) score += 10;
  
  // Discount bonus
  if (product.discount > 0) score += 5;

  return score;
}

/**
 * Get recommended products for a farmer based on their crop
 */
export async function getRecommendedProducts(crop, farmerId, limit = 8) {
  try {
    // Get all active products
    const allProducts = await Product.find({ isActive: true, quantity: { $gt: 0 } })
      .populate('ownerId', 'agroName city')
      .lean();

    if (!allProducts.length) return [];

    // Get farmer's previous orders to boost already-liked products
    const previousOrders = farmerId 
      ? await Order.find({ farmerId }).populate('productId', 'category').lean()
      : [];
    
    const preferredCategories = new Set(
      previousOrders.map(o => o.productId?.category).filter(Boolean)
    );

    // Score and rank
    const scored = allProducts.map(product => {
      let score = scoreProduct(product, crop);
      // Boost previously purchased category
      if (preferredCategories.has(product.category)) score += 15;
      return { ...product, recommendationScore: score, recommendationReason: getRecommendationReason(product, crop) };
    });

    // Sort by score descending, return top N
    return scored
      .filter(p => p.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);
  } catch (err) {
    console.error('Recommendation service error:', err);
    return [];
  }
}

function getRecommendationReason(product, crop) {
  const cat = product.category;
  if (cat === 'Seed') return `Recommended seed for ${crop} cultivation`;
  if (cat === 'Fertilizer') return `Suitable fertilizer for ${crop} growth stage`;
  if (cat === 'Machinery') return `Useful equipment for ${crop} farming operations`;
  return `Commonly used in ${crop} farming`;
}
