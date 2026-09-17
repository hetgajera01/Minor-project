/**
 * Smart Product Recommendation Service
 *
 * Recommends marketplace products based on:
 * - Farmer's crop
 * - Product category
 * - Product keywords
 * - Previous purchase history
 */

import Product from "../DB/Product.js";
import Order from "../DB/Order.js";

const CROP_PRODUCT_MAP = {
  Rice: {
    categories: ["Seed", "Fertilizer"],
    keywords: ["rice", "paddy", "urea", "dap", "irrigation", "spray pump"],
  },
  Wheat: {
    categories: ["Seed", "Fertilizer"],
    keywords: ["wheat", "urea", "potash", "fungicide", "seed drill"],
  },
  Cotton: {
    categories: ["Seed", "Fertilizer", "Other"],
    keywords: ["cotton", "bt cotton", "drip", "pesticide", "bollworm"],
  },
  Maize: {
    categories: ["Seed", "Fertilizer"],
    keywords: ["maize", "corn", "hybrid seed", "npk", "irrigation"],
  },
  Sugarcane: {
    categories: ["Seed", "Fertilizer", "Machinery"],
    keywords: ["sugarcane", "ratoon", "drip irrigation", "nitrogen"],
  },
  Soybean: {
    categories: ["Seed", "Fertilizer"],
    keywords: ["soybean", "rhizobium", "phosphorus", "herbicide"],
  },
  Tomato: {
    categories: ["Seed", "Fertilizer", "Other"],
    keywords: ["tomato", "drip", "calcium", "fungicide", "trellis"],
  },
  Groundnut: {
    categories: ["Seed", "Fertilizer"],
    keywords: ["groundnut", "peanut", "gypsum", "calcium", "bore well"],
  },
  Onion: {
    categories: ["Seed", "Fertilizer"],
    keywords: ["onion", "phosphorus", "potash", "cold storage"],
  },
  Potato: {
    categories: ["Seed", "Fertilizer", "Machinery"],
    keywords: ["potato", "seed potato", "ridger", "pesticide"],
  },
  Chickpea: {
    categories: ["Seed", "Fertilizer"],
    keywords: ["chickpea", "gram", "rhizobium", "phosphorus"],
  },
  Mustard: {
    categories: ["Seed", "Fertilizer"],
    keywords: ["mustard", "sulphur", "boron", "dap"],
  },
  General: {
    categories: ["Seed", "Fertilizer", "Machinery", "Other"],
    keywords: ["organic", "compost", "spray pump", "tools"],
  },
};

function getCropMapping(crop) {
  return CROP_PRODUCT_MAP[crop] || CROP_PRODUCT_MAP.General;
}

function calculateKeywordScore(product, keywords) {
  const productText =
    `${product.name} ${product.description || ""}`.toLowerCase();

  let score = 0;

  keywords.forEach((keyword) => {
    if (productText.includes(keyword.toLowerCase())) {
      score += 20;
    }
  });

  return score;
}

function scoreProduct(product, crop) {
  const mapping = getCropMapping(crop);
  let score = 0;

  if (mapping.categories.includes(product.category)) {
    score += 40;
  }

  score += calculateKeywordScore(product, mapping.keywords);

  if (product.quantity > 0) {
    score += 10;
  }

  if (product.discount > 0) {
    score += 5;
  }

  return score;
}

async function fetchPreviousOrders(farmerId) {
  if (!farmerId) {
    return [];
  }

  return Order.find({ farmerId })
    .populate("productId", "category")
    .lean();
}

function extractPreferredCategories(orders) {
  return new Set(
    orders
      .map((order) => order.productId?.category)
      .filter(Boolean)
  );
}

function getRecommendationReason(product, crop) {
  switch (product.category) {
    case "Seed":
      return `Recommended seed for ${crop} cultivation`;

    case "Fertilizer":
      return `Suitable fertilizer for ${crop} growth stage`;

    case "Machinery":
      return `Useful equipment for ${crop} farming operations`;

    default:
      return `Commonly used in ${crop} farming`;
  }
}

function prepareProductRecommendation(product, crop, preferredCategories) {
  let score = scoreProduct(product, crop);

  if (preferredCategories.has(product.category)) {
    score += 15;
  }

  return {
    ...product,
    recommendationScore: score,
    recommendationReason: getRecommendationReason(product, crop),
  };
}

function sortAndLimitProducts(products, limit) {
  return products
    .filter((product) => product.recommendationScore > 0)
    .sort(
      (firstProduct, secondProduct) =>
        secondProduct.recommendationScore -
        firstProduct.recommendationScore
    )
    .slice(0, limit);
}

export async function getRecommendedProducts(
  crop,
  farmerId,
  limit = 8
) {
  try {
    const products = await Product.find({
      isActive: true,
      quantity: { $gt: 0 },
    })
      .populate("ownerId", "agroName city")
      .lean();

    if (products.length === 0) {
      return [];
    }

    const orders = await fetchPreviousOrders(farmerId);
    const preferredCategories = extractPreferredCategories(orders);

    const recommendations = products.map((product) =>
      prepareProductRecommendation(
        product,
        crop,
        preferredCategories
      )
    );

    return sortAndLimitProducts(recommendations, limit);
  } catch (error) {
    console.error("Recommendation service error:", error);
    return [];
  }
}