import express from "express";
import User from "./User.js";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import AgroBusiness from "./AgroBusiness.js";
import crypto from "crypto";
import Expense from "./Expense.js";
import axios from "axios";
import Income from "./Income.js";
import Person from "./Person.js";
import Transaction from "./Transaction.js";
import Crop from "./Crop.js";
import Alert from "./Alert.js";
import Settings from "./Settings.js";
import Product from "./Product.js";
import FarmerRequest from "./FarmerRequest.js";
import Order from "./Order.js";
import Request from "./Request.js";
import Notification from "./Notification.js";
// ── AI/ML Feature imports ─────────────────────────────────────────────
import AIConversation    from "./AIConversation.js";
import CropPrediction    from "./CropPrediction.js";
import DiseasePrediction from "./DiseasePrediction.js";
// ── Stage 3: Digital Twin Farm Config ─────────────────────────────────
import FarmConfig from "./FarmConfig.js";
import { chat as aiChat }                       from "../services/aiService.js";
import { recommendCrop, predictYieldAndProfit } from "../services/cropMLService.js";
import { detectDisease }                         from "../services/diseaseService.js";
import { getRecommendedProducts }               from "../services/recommendationService.js";
import { v4 as uuidv4 }                          from "uuid";
const router = express.Router();

// File upload setup for logos and ID proofs
const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Agro-Business Registration
router.post('/agro/register', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'idProof', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      agroName,
      ownerName,
      email,
      phone,
      password,
      city,
      address,
      location,
      agroType,
      services,
      gstNumber,
      socialLinks,
      workingHours
    } = req.body;

    if (!agroName || !ownerName || !email || !phone || !password || !city || !address || !agroType || !gstNumber) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingAgro = await AgroBusiness.findOne({ email });
    if (existingAgro) return res.status(400).json({ message: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);

    const logoFile = req.files?.logo?.[0];
    const idProofFile = req.files?.idProof?.[0];

    const newAgro = new AgroBusiness({
      agroName,
      ownerName,
      email,
      phone,
      passwordHash,
      city,
      address,
      location,
      agroType,
      services: services ? (Array.isArray(services) ? services : String(services).split(',').map(s => s.trim()).filter(Boolean)) : [],
      gstNumber,
      socialLinks: socialLinks ? (Array.isArray(socialLinks) ? socialLinks : String(socialLinks).split(',').map(s => s.trim()).filter(Boolean)) : [],
      workingHours: workingHours ? JSON.parse(workingHours) : undefined,
      logoPath: logoFile ? `/uploads/${logoFile.filename}` : undefined,
      idProofPath: idProofFile ? `/uploads/${idProofFile.filename}` : undefined,
    });

    await newAgro.save();
    const { passwordHash: _ph, ...agroSafe } = newAgro.toObject();
    res.status(201).json({ message: 'Agro-Business account created', agro: agroSafe });
  } catch (err) {
    console.error('Agro register error:', err);
    res.status(500).json({ message: err.message || 'Registration failed' });
  }
});

// Products CRUD
router.post('/product', upload.single('image'), async (req, res) => {
  try {
    const { email, name, category, price, quantity, discount = 0, description } = req.body;
    if (!email || !name || !category || !price || !quantity) {
      return res.status(400).json({ message: 'Missing required fields: email, name, category, price, quantity' });
    }
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    const product = new Product({
      ownerId: agro._id,
      name,
      category,
      price: Number(price),
      quantity: Number(quantity),
      discount: Number(discount) || 0,
      description: description || '',
      imagePath,
      isActive: true, // Ensure product is active by default
    });
    await product.save();
    console.log(`Product created: ${product._id} for agro ${agro._id}`);
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/product', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    // Return all products for the owner, regardless of isActive status or creation date
    const products = await Product.find({ ownerId: agro._id }).sort({ createdAt: -1 });
    console.log(`Found ${products.length} products for agro ${agro._id}`);
    // Log product dates for debugging
    if (products.length > 0) {
      const oldestProduct = products[products.length - 1];
      const newestProduct = products[0];
      console.log(`Product date range: Oldest: ${oldestProduct.createdAt}, Newest: ${newestProduct.createdAt}`);
    }
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: err.message });
  }
});

router.put('/product/:id', upload.single('image'), async (req, res) => {
  try {
    const { email, ...updates } = req.body;
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    const prod = await Product.findOne({ _id: req.params.id, ownerId: agro._id });
    if (!prod) return res.status(404).json({ message: 'Product not found' });
    
    if (req.file) {
      updates.imagePath = `/uploads/${req.file.filename}`;
    }
    
    Object.assign(prod, updates);
    await prod.save();
    res.json({ message: 'Product updated', product: prod });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/product/:id', async (req, res) => {
  try {
    const { email } = req.body;
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    const deleted = await Product.findOneAndDelete({ _id: req.params.id, ownerId: agro._id });
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Marketplace - Get all products for farmers
router.get('/marketplace/products', async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    let filter = { isActive: true };
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    const products = await Product.find(filter)
      .populate('ownerId', 'agroName city')
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Place Order
router.post('/order', async (req, res) => {
  try {
    const { farmerEmail, productId, quantity, deliveryAddress } = req.body;
    
    const farmer = await User.findOne({ email: farmerEmail });
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    
    const product = await Product.findById(productId).populate('ownerId');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }
    
    const discountAmount = (product.price * product.discount) / 100;
    const discountedPrice = product.price - discountAmount;
    const totalPrice = discountedPrice * quantity;
    
    const order = new Order({
      productId: product._id,
      farmerId: farmer._id,
      agroId: product.ownerId._id,
      quantity,
      totalPrice,
      farmerName: farmer.name,
      farmerPhone: farmer.phone,
      farmerEmail: farmer.email,
      deliveryAddress,
    });
    
    await order.save();
    
    // Deduct quantity from product stock
    await Product.findByIdAndUpdate(product._id, { $inc: { quantity: -Number(quantity) } });
    
    // Create notification for agro business
    const notification = new Notification({
      userId: product.ownerId._id,
      userRole: 'agro',
      type: 'Order',
      title: 'New Order Received',
      body: `${farmer.name} placed an order for ${quantity} units of ${product.name}`,
      relatedId: order._id,
    });
    await notification.save();
    
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send Request/Enquiry
router.post('/request', async (req, res) => {
  try {
    const { farmerEmail, productId, message } = req.body;
    
    const farmer = await User.findOne({ email: farmerEmail });
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    
    const product = await Product.findById(productId).populate('ownerId');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const request = new Request({
      productId: product._id,
      farmerId: farmer._id,
      agroId: product.ownerId._id,
      message,
      farmerName: farmer.name,
      farmerPhone: farmer.phone,
      farmerEmail: farmer.email,
    });
    
    await request.save();
    
    // Create notification for agro business
    const notification = new Notification({
      userId: product.ownerId._id,
      userRole: 'agro',
      type: 'Request',
      title: 'New Enquiry Received',
      body: `${farmer.name} sent an enquiry about ${product.name}`,
      relatedId: request._id,
    });
    await notification.save();
    
    res.status(201).json({ message: 'Request sent successfully', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get farmer's orders
router.get('/farmer/orders', async (req, res) => {
  try {
    const { email } = req.query;
    const farmer = await User.findOne({ email });
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    
    const orders = await Order.find({ farmerId: farmer._id })
      .populate('productId', 'name category price imagePath')
      .populate('agroId', 'agroName city')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get agro's orders
router.get('/agro/orders', async (req, res) => {
  try {
    const { email } = req.query;
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    const orders = await Order.find({ agroId: agro._id })
      .populate('productId', 'name category price imagePath')
      .populate('farmerId', 'name phone email')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get agro's requests
router.get('/agro/requests', async (req, res) => {
  try {
    const { email } = req.query;
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    const requests = await Request.find({ agroId: agro._id })
      .populate('productId', 'name category price imagePath')
      .populate('farmerId', 'name phone email')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status
router.patch('/order/:id/status', async (req, res) => {
  try {
    const { email, status, paymentStatus } = req.body;
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    const order = await Order.findOne({ _id: req.params.id, agroId: agro._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    await order.save();
    
    // Create notification for farmer
    const notification = new Notification({
      userId: order.farmerId,
      userRole: 'farmer',
      type: 'Order',
      title: 'Order Status Updated',
      body: `Your order status has been updated to ${status}`,
      relatedId: order._id,
    });
    await notification.save();
    
    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Respond to request
router.patch('/request/:id/respond', async (req, res) => {
  try {
    const { email, response, status } = req.body;
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    const request = await Request.findOne({ _id: req.params.id, agroId: agro._id });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    request.response = response;
    request.status = status || 'Responded';
    
    await request.save();
    
    // Create notification for farmer
    const notification = new Notification({
      userId: request.farmerId,
      userRole: 'farmer',
      type: 'Request',
      title: 'Response Received',
      body: `You received a response to your enquiry`,
      relatedId: request._id,
    });
    await notification.save();
    
    res.json({ message: 'Response sent', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Orders listing (basic)
router.get('/orders', async (req, res) => {
  try {
    const { email } = req.query;
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    const orders = await Order.find({ agroId: agro._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get notifications for user
router.get('/notifications', async (req, res) => {
  try {
    const { email, userRole } = req.query;
    
    let user;
    if (userRole === 'agro') {
      user = await AgroBusiness.findOne({ email });
    } else {
      user = await User.findOne({ email });
    }
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const notifs = await Notification.find({ 
      userId: user._id, 
      userRole: userRole || 'farmer' 
    }).sort({ createdAt: -1 });
    
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const { email, userRole } = req.body;
    
    let user;
    if (userRole === 'agro') {
      user = await AgroBusiness.findOne({ email });
    } else {
      user = await User.findOne({ email });
    }
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: user._id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Dismiss (delete) a notification
router.delete('/notifications/:id', async (req, res) => {
  try {
    const { email, userRole } = req.body;
    let user;
    if (userRole === 'agro') {
      user = await AgroBusiness.findOne({ email });
    } else {
      user = await User.findOne({ email });
    }
    if (!user) return res.status(404).json({ message: 'User not found' });
    const result = await Notification.deleteOne({ _id: req.params.id, userId: user._id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification dismissed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Simple analytics placeholder
router.get('/analytics', async (req, res) => {
  try {
    const { email } = req.query;
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    const [orders, products] = await Promise.all([
      Order.find({ agroId: agro._id }),
      Product.find({ ownerId: agro._id })
    ]);
    const monthlySales = {};
    orders.forEach(o => {
      const k = new Date(o.createdAt).toISOString().slice(0,7);
      monthlySales[k] = (monthlySales[k] || 0) + (o.totalPrice || 0);
    });
    res.json({
      totalProducts: products.length,
      totalOrders: orders.length,
      monthlySales,
      topProducts: products.slice(0,5).map(p => ({ name: p.name, sold: Math.floor(Math.random()*50)+1 }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Shared Auth Login for Farmer and Agro
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    // Try farmer first
    let account = await User.findOne({ email });
    if (account) {
      const isMatch = await bcrypt.compare(password, account.password);
      if (isMatch) {
        const { password: _pw, ...farmerSafe } = account.toObject();
        return res.json({ role: 'farmer', ...farmerSafe });
      }
      // If farmer password doesn't match, continue to try agro-business before failing
    }

    // Try agro-business
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'User not found' });
    const ok = await bcrypt.compare(password, agro.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Incorrect password' });
    const { passwordHash: _ph, ...agroSafe } = agro.toObject();
    return res.json({ role: 'agro', ...agroSafe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Simple Agro dashboard data
router.get('/agro/dashboard', async (req, res) => {
  try {
    const { email, id } = req.query;
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });

    // Aggregations - return all products regardless of isActive status
    // Note: For dashboard summary, we limit to recent items, but full product list is available via /product endpoint
    const [products, orders, notifications] = await Promise.all([
      Product.find({ ownerId: agro._id }).sort({ createdAt: -1 }).limit(8),
      Order.find({ agroId: agro._id }).sort({ createdAt: -1 }).limit(10),
      Notification.find({ userId: agro._id, userRole: 'agro' }).sort({ createdAt: -1 }).limit(10)
    ]);
    console.log(`Dashboard: Found ${products.length} products for agro ${agro._id}`);

    const statusCounts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, { Placed: 0, Accepted: 0, Shipped: 0, Completed: 0, Rejected: 0 });

    const totalRevenue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const unreadNotifications = notifications.filter(n => !n.isRead).length;

    const dashboard = {
      summary: {
        agroName: agro.agroName,
        agroType: agro.agroType,
        city: agro.city,
        workingHours: agro.workingHours || null,
        logoPath: agro.logoPath || null,
        servicesCount: (agro.services || []).length,
      },
      services: agro.services || [],
      stats: {
        products: products.length,
        orders: orders.length,
        pendingOrders: statusCounts.Placed,
        revenue: totalRevenue,
        unreadNotifications,
      },
      recent: {
        products,
        orders,
        notifications,
      }
    };
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Agro Dashboard: metrics only
router.get('/agro/dashboard/metrics', async (req, res) => {
  try {
    const { id, email } = req.query;
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });

    // Count all products regardless of isActive status
    const [productsCount, orders, completedOrders] = await Promise.all([
      Product.countDocuments({ ownerId: agro._id }),
      Order.find({ agroId: agro._id }).select('status totalPrice'),
      Order.find({ agroId: agro._id, status: 'Completed' }).select('totalPrice')
    ]);
    const ordersCount = orders.length;
    const pendingOrders = orders.filter(o => (o.status === 'Placed' || o.status === 'Pending')).length;
    const revenue = completedOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    console.log(`Metrics: ${productsCount} products, ${ordersCount} orders for agro ${agro._id}`);
    res.json({ products: productsCount, orders: ordersCount, pendingOrders, revenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Agro profile minimal
router.get('/agro/profile', async (req, res) => {
  try {
    const { id, email } = req.query;
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    const { passwordHash, resetToken, resetTokenExpires, ...safe } = agro.toObject();
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Agro services
router.get('/agro/services', async (req, res) => {
  try {
    const { id, email } = req.query;
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    res.json({ services: agro.services || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/agro/services', async (req, res) => {
  try {
    const { id, email, service } = req.body;
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    if (!service || !String(service).trim()) return res.status(400).json({ message: 'Service is required' });
    const list = Array.isArray(agro.services) ? agro.services : [];
    list.push(String(service).trim());
    agro.services = Array.from(new Set(list));
    await agro.save();
    res.json({ message: 'Service added', services: agro.services });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Recent products
router.get('/agro/products/recent', async (req, res) => {
  try {
    const { id, email, limit = 10 } = req.query;
    console.log('Recent products request:', { id, email, limit });
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    console.log('Found agro business:', agro._id);
    // Return all products, regardless of isActive status, sorted by newest first
    const products = await Product.find({ ownerId: agro._id }).sort({ createdAt: -1 }).limit(Number(limit));
    console.log(`Found ${products.length} recent products for agro ${agro._id}`);
    res.json(products);
  } catch (err) {
    console.error('Error in recent products:', err);
    res.status(500).json({ message: err.message });
  }
});

// Recent orders
router.get('/agro/orders/recent', async (req, res) => {
  try {
    const { id, email, limit = 5 } = req.query;
    console.log('Recent orders request:', { id, email, limit });
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    console.log('Found agro business for orders:', agro._id);
    const orders = await Order.find({ agroId: agro._id })
      .populate('productId', 'name category price imagePath')
      .populate('farmerId', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    console.log('Found orders:', orders.length);
    res.json(orders);
  } catch (err) {
    console.error('Error in recent orders:', err);
    res.status(500).json({ message: err.message });
  }
});

// Recent notifications for agro
router.get('/agro/notifications', async (req, res) => {
  try {
    const { id, email, limit = 5 } = req.query;
    console.log('Recent notifications request:', { id, email, limit });
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    console.log('Found agro business for notifications:', agro._id);
    const notifications = await Notification.find({ userId: agro._id, userRole: 'agro' })
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    console.log('Found notifications:', notifications.length);
    res.json(notifications);
  } catch (err) {
    console.error('Error in recent notifications:', err);
    res.status(500).json({ message: err.message });
  }
});

// Agro-Business Forgot Password - generate reset token
router.post('/agro/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'User not found' });
    const token = crypto.randomBytes(20).toString('hex');
    agro.resetToken = token;
    agro.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await agro.save();
    // In production, send email or WhatsApp. For now, return token for client flow.
    res.json({ message: 'Reset token generated', token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Agro-Business Reset Password using token
router.post('/agro/reset', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });
    const passwordHash = await bcrypt.hash(password, 10);
    const updated = await AgroBusiness.findOneAndUpdate(
      { resetToken: token, resetTokenExpires: { $gt: new Date() } },
      { $set: { passwordHash }, $unset: { resetToken: "", resetTokenExpires: "" } },
      { new: true }
    );
    if (!updated) return res.status(400).json({ message: 'Invalid or expired token' });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper function to generate alerts for budget usage
const generateBudgetAlerts = async (userId, cropId, cropName, currentAmount, budget) => {
  try {
    const usagePercentage = (currentAmount / budget) * 100;
    
    // Check for existing alerts to avoid duplicates
    const existingAlerts = await Alert.find({ 
      user: userId, 
      crop: cropId, 
      isDismissed: false 
    });
    
    let alertsCreated = [];
    
    // Warning alert at 90%
    if (usagePercentage >= 90 && usagePercentage < 100) {
      const hasWarning = existingAlerts.some(a => a.alertType === 'warning');
      if (!hasWarning) {
        const warningAlert = new Alert({
          user: userId,
          crop: cropId,
          cropName,
          alertType: 'warning',
          message: `Budget usage for ${cropName} has reached ${usagePercentage.toFixed(1)}%`,
          budgetUsage: usagePercentage,
          threshold: 90,
          amount: currentAmount,
          budget,
          sentVia: [{ method: 'in-app', status: 'sent' }]
        });
        await warningAlert.save();
        alertsCreated.push(warningAlert);
      }
    }
    
    // Over-budget alert at 100%
    if (usagePercentage >= 100) {
      const hasOverBudget = existingAlerts.some(a => a.alertType === 'over-budget');
      if (!hasOverBudget) {
        const overBudgetAlert = new Alert({
          user: userId,
          crop: cropId,
          cropName,
          alertType: 'over-budget',
          message: `Budget for ${cropName} has been exceeded by ₹${(currentAmount - budget).toFixed(2)}`,
          budgetUsage: usagePercentage,
          threshold: 100,
          amount: currentAmount,
          budget,
          sentVia: [{ method: 'in-app', status: 'sent' }]
        });
        await overBudgetAlert.save();
        alertsCreated.push(overBudgetAlert);
      }
    }
    
    return alertsCreated;
  } catch (error) {
    console.error('Error generating budget alerts:', error);
    return [];
  }
};

// Crop management
router.post('/crop', async (req, res) => {
  try {
    const { email, name, startDate, expectedHarvestDate, plannedBudget } = req.body;
    if (!email || !name || !startDate || !expectedHarvestDate || plannedBudget == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const crop = new Crop({
      user: user._id,
      name,
      startDate: new Date(startDate),
      expectedHarvestDate: new Date(expectedHarvestDate),
      plannedBudget: Number(plannedBudget),
    });
    await crop.save();
    res.status(201).json({ message: 'Crop added', crop });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/crop', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const crops = await Crop.find({ user: user._id }).sort({ createdAt: -1 });
    res.json(crops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/crop/summary', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const [crops, expenses] = await Promise.all([
      Crop.find({ user: user._id }),
      Expense.find({ user: user._id }),
    ]);
    const summaries = crops.map(c => {
      const spent = expenses.filter(e => e.crop === c.name).reduce((s, e) => s + e.amount, 0);
      return {
        name: c.name,
        plannedBudget: c.plannedBudget,
        totalSpent: spent,
        remainingBudget: c.plannedBudget - spent,
      };
    });
    const totals = summaries.reduce((acc, s) => {
      acc.plannedBudget += s.plannedBudget;
      acc.totalSpent += s.totalSpent;
      acc.remainingBudget += s.remainingBudget;
      return acc;
    }, { plannedBudget: 0, totalSpent: 0, remainingBudget: 0 });
    res.json({ summaries, totals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/crop/expenses', async (req, res) => {
  try {
    const { email, crop } = req.query;
    if (!email || !crop) return res.status(400).json({ message: 'Email and crop are required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const cropDoc = await Crop.findOne({ user: user._id, name: crop });
    if (!cropDoc) return res.status(404).json({ message: 'Crop not found' });
    const expenses = await Expense.find({ user: user._id, crop }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Alert management endpoints
router.get('/alerts', async (req, res) => {
  try {
    const { email, unreadOnly = false } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const filter = { user: user._id, isDismissed: false };
    if (unreadOnly === 'true') filter.isRead = false;
    
    const alerts = await Alert.find(filter)
      .populate('crop', 'name startDate expectedHarvestDate')
      .sort({ createdAt: -1 });
    
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/alerts/:id/read', async (req, res) => {
  try {
    const { email } = req.body;
    const { id } = req.params;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const alert = await Alert.findOneAndUpdate(
      { _id: id, user: user._id },
      { isRead: true },
      { new: true }
    );
    
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json({ message: 'Alert marked as read', alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/alerts/:id/dismiss', async (req, res) => {
  try {
    const { email } = req.body;
    const { id } = req.params;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email is required' });
    
    const alert = await Alert.findOneAndUpdate(
      { _id: id, user: user._id },
      { isDismissed: true },
      { new: true }
    );
    
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json({ message: 'Alert dismissed', alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/crop/:id/threshold', async (req, res) => {
  try {
    const { email, threshold } = req.body;
    const { id } = req.params;
    if (!email || threshold === undefined) return res.status(400).json({ message: 'Email and threshold are required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const crop = await Crop.findOne({ _id: id, user: user._id });
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    
    // Persist the custom threshold on the crop
    crop.customThreshold = Number(threshold);
    await crop.save();

    // Check if threshold is already crossed
    const cropExpenses = await Expense.find({ user: user._id, crop: crop.name });
    const totalSpent = cropExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const usagePercentage = (totalSpent / crop.plannedBudget) * 100;
    
    if (usagePercentage >= threshold) {
      // Create custom threshold alert
      const customAlert = new Alert({
        user: user._id,
        crop: crop._id,
        cropName: crop.name,
        alertType: 'custom-threshold',
        message: `Custom threshold of ${threshold}% reached for ${crop.name}`,
        budgetUsage: usagePercentage,
        threshold: threshold,
        amount: totalSpent,
        budget: crop.plannedBudget,
        customThreshold: threshold,
        sentVia: [{ method: 'in-app', status: 'sent' }]
      });
      await customAlert.save();
    }
    
    res.json({ message: 'Custom threshold set', threshold, currentUsage: usagePercentage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register User
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered. Please log in." });

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = userType === 'agro' ? 'agro' : 'farmer'; // map userType → role
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by email
router.post("/by-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  console.log("login")

  try {
    console.log(req.body)
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email });
    console.log(user)
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add Expense
router.post("/expense", async (req, res) => {
  try {
    const { email, amount, category, crop, date, note } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required", field: 'email' });
    if (!amount || isNaN(amount) || amount <= 0) return res.status(400).json({ message: "Valid amount is required", field: 'amount' });
    if (!category || category.trim() === '') return res.status(400).json({ message: "Category is required", field: 'category' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found", field: 'email' });
    
    // Optional: validate crop name exists for this user
    let cropName = crop ? crop.trim() : undefined;
    let cropDoc = null;
    if (cropName) {
      cropDoc = await Crop.findOne({ user: user._id, name: cropName });
      if (!cropDoc) {
        return res.status(400).json({ message: "Selected crop does not exist", field: 'crop' });
      }
    }
    
    const expense = new Expense({
      user: user._id,
      amount: parseFloat(amount),
      category: category.trim(),
      crop: cropName,
      date: date ? new Date(date) : new Date(),
      note: note ? note.trim() : undefined,
    });
    await expense.save();
    
    // Generate budget alerts if this is a crop expense
    if (cropDoc) {
      const cropExpenses = await Expense.find({ user: user._id, crop: cropName });
      const totalSpent = cropExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    // Built-in 90%/100% alerts
    await generateBudgetAlerts(user._id, cropDoc._id, cropName, totalSpent, cropDoc.plannedBudget);

    // Custom threshold alert if saved on crop and crossed
    if (typeof cropDoc.customThreshold === 'number' && !Number.isNaN(cropDoc.customThreshold)) {
      const usagePercentage = (totalSpent / cropDoc.plannedBudget) * 100;
      if (usagePercentage >= cropDoc.customThreshold) {
        const existingCustom = await Alert.findOne({
          user: user._id,
          crop: cropDoc._id,
          alertType: 'custom-threshold',
          isDismissed: false,
        });
        if (!existingCustom) {
          const customAlert = new Alert({
            user: user._id,
            crop: cropDoc._id,
            cropName: cropName,
            alertType: 'custom-threshold',
            message: `Custom threshold of ${cropDoc.customThreshold}% reached for ${cropName}`,
            budgetUsage: usagePercentage,
            threshold: cropDoc.customThreshold,
            amount: totalSpent,
            budget: cropDoc.plannedBudget,
            customThreshold: cropDoc.customThreshold,
            sentVia: [{ method: 'in-app', status: 'sent' }]
          });
          await customAlert.save();
        }
      }
    }
    }
    
    res.status(201).json({ 
      success: true,
      message: "Expense added successfully", 
      expense 
    });
  } catch (err) {
    console.error('Add expense error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to add expense',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
});

// Add Income
router.post("/income", async (req, res) => {
  try {
    const { email, amount, category, crop, date, note } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required", field: 'email' });
    if (!amount || isNaN(amount) || amount <= 0) return res.status(400).json({ message: "Valid amount is required", field: 'amount' });
    if (!category || category.trim() === '') return res.status(400).json({ message: "Category is required", field: 'category' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found", field: 'email' });
    
    // Optional: validate crop name exists for this user
    let cropName = crop ? crop.trim() : undefined;
    if (cropName) {
      const cropDoc = await Crop.findOne({ user: user._id, name: cropName });
      if (!cropDoc) {
        return res.status(400).json({ message: "Selected crop does not exist", field: 'crop' });
      }
    }
    
    const income = new Income({
      user: user._id,
      amount: parseFloat(amount),
      category: category.trim(),
      crop: cropName,
      date: date ? new Date(date) : new Date(),
      note: note ? note.trim() : undefined,
    });
    await income.save();
    
    res.status(201).json({ 
      success: true,
      message: "Income added successfully", 
      income 
    });
  } catch (err) {
    console.error('Add income error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to add income',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
});

// Get Reports with filters
router.post("/reports", async (req, res) => {
  try {
    const { email, startDate, endDate, filterType, selectedMonth, selectedYear } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    let start, end;
    const now = new Date();
    const year = selectedYear ? Number(selectedYear) : now.getFullYear();
    const monthIndex = selectedMonth ? Number(selectedMonth) - 1 : now.getMonth();
    
    // Set date range based on filter type
    switch (filterType) {
      case 'month':
        start = new Date(year, monthIndex, 1);
        end = new Date(year, monthIndex + 1, 0);
        break;
      case 'year':
        start = new Date(year, 0, 1);
        end = new Date(year, 11, 31);
        break;
      case 'custom':
        start = startDate ? new Date(startDate) : new Date(now.getFullYear(), 0, 1);
        end = endDate ? new Date(endDate) : now;
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Get income and expenses for the date range
    const income = await Income.find({
      user: user._id,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    const expenses = await Expense.find({
      user: user._id,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    // Calculate totals
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    // Group by category
    const incomeByCategory = {};
    const expensesByCategory = {};

    income.forEach(item => {
      incomeByCategory[item.category] = (incomeByCategory[item.category] || 0) + item.amount;
    });

    expenses.forEach(item => {
      expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + item.amount;
    });

    // Group by date for trend analysis
    const incomeByDate = {};
    const expensesByDate = {};

    income.forEach(item => {
      const dateKey = item.date.toISOString().split('T')[0];
      incomeByDate[dateKey] = (incomeByDate[dateKey] || 0) + item.amount;
    });

    expenses.forEach(item => {
      const dateKey = item.date.toISOString().split('T')[0];
      expensesByDate[dateKey] = (expensesByDate[dateKey] || 0) + item.amount;
    });

    // Build crop summaries
    const crops = await Crop.find({ user: user._id });
    const cropSummaries = crops.map(c => {
      const spent = expenses.filter(e => e.crop === c.name).reduce((s, e) => s + e.amount, 0);
      return {
        name: c.name,
        plannedBudget: c.plannedBudget,
        totalSpent: spent,
        remainingBudget: c.plannedBudget - spent,
      }
    });

    res.json({
      totalIncome,
      totalExpenses,
      netProfit,
      incomeByCategory,
      expensesByCategory,
      incomeByDate,
      expensesByDate,
      income,
      expenses,
      dateRange: { start, end },
      cropSummaries,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all income and expenses for a user
router.post("/all-transactions", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const income = await Income.find({ user: user._id }).sort({ date: -1 });
    const expenses = await Expense.find({ user: user._id }).sort({ date: -1 });

    res.json({ income, expenses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Person management
router.post('/person', async (req, res) => {
  try {
    const { email, name, role, photo } = req.body;
    if (!email || !name) return res.status(400).json({ message: 'Email and name are required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const person = new Person({ name, role, photo, created_by: user._id });
    await person.save();
    res.status(201).json({ message: 'Person created', person });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/person', async (req, res) => {
  try {
    const { email, q } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const filter = { created_by: user._id };
    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    }
    const people = await Person.find(filter).sort({ createdAt: -1 });
    res.json(people);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/person/:id/transactions', async (req, res) => {
  try {
    const { email } = req.query;
    const { id } = req.params;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const txns = await Transaction.find({ user: user._id, person: id }).sort({ date: -1 });
    res.json(txns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Transaction management
router.post('/transaction', async (req, res) => {
  try {
    const { email, personId, type, amount, category, date, description, crop, project } = req.body;
    
    // Detailed validation
    if (!email) return res.status(400).json({ message: 'Email is required', field: 'email' });
    if (!personId) return res.status(400).json({ message: 'Person ID is required', field: 'personId' });
    if (!type) return res.status(400).json({ message: 'Type (income/expense) is required', field: 'type' });
    if (type !== 'income' && type !== 'expense') return res.status(400).json({ message: 'Type must be either "income" or "expense"', field: 'type' });
    if (!amount || isNaN(amount) || amount <= 0) return res.status(400).json({ message: 'Valid amount is required', field: 'amount' });
    if (!category || category.trim() === '') return res.status(400).json({ message: 'Category is required', field: 'category' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found', field: 'email' });
    
    // Verify person exists and belongs to this user
    const person = await Person.findById(personId);
    if (!person) return res.status(404).json({ message: 'Person not found', field: 'personId' });
    
    // Handle schema mismatch: created_by might be undefined for legacy records
    const personOwnerId = person.created_by || person.user;
    if (!personOwnerId || personOwnerId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Person does not belong to this user' });
    }
    
    const transactionData = {
      user: user._id,
      person: personId,
      type,
      amount: parseFloat(amount),
      category: category.trim(),
      date: date ? new Date(date) : new Date(),
      description: description ? description.trim() : undefined,
      crop: crop ? crop.trim() : undefined,
      project: project ? project.trim() : undefined,
    };
    
    const txn = new Transaction(transactionData);
    await txn.save();

    // Mirror to main Income/Expense collections for compatibility
    if (type === 'income') {
      const inc = new Income({
        user: user._id,
        person: personId,
        amount: parseFloat(amount),
        category: category.trim(),
        crop: crop ? crop.trim() : undefined,
        date: date ? new Date(date) : new Date(),
        note: description ? description.trim() : undefined,
      });
      await inc.save();
    } else if (type === 'expense') {
      const exp = new Expense({
        user: user._id,
        person: personId,
        amount: parseFloat(amount),
        category: category.trim(),
        crop: crop ? crop.trim() : undefined,
        date: date ? new Date(date) : new Date(),
        note: description ? description.trim() : undefined,
      });
      await exp.save();
    }

    res.status(201).json({ 
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`, 
      transaction: txn 
    });
  } catch (err) {
    console.error('Transaction error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to add transaction', 
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const { email, person_id, month, category, crop } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required', field: 'email' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found', field: 'email' });

    const filter = { user: user._id };
    
    if (person_id && person_id !== 'undefined' && person_id !== '') {
      // Verify person exists and belongs to this user
      const person = await Person.findById(person_id);
      if (person && person.created_by && person.created_by.toString() === user._id.toString()) {
        filter.person = person_id;
      }
    }
    
    if (category && category !== 'undefined' && category !== '') {
      filter.category = { $regex: category, $options: 'i' }; // Case-insensitive search
    }
    
    if (crop && crop !== 'undefined' && crop !== '') {
      filter.crop = { $regex: crop, $options: 'i' }; // Case-insensitive search
    }

    if (month && month !== 'undefined' && month !== '') {
      const [y, m] = month.split('-').map(Number); // YYYY-MM
      if (y && m) {
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0, 23, 59, 59, 999);
        filter.date = { $gte: start, $lte: end };
      }
    }

    const txns = await Transaction.find(filter)
      .populate('person', 'name role photo')
      .sort({ date: -1 })
      .lean();
    
    res.json(txns);
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to fetch transactions',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
});

// Settings management
router.get('/settings', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({ user: user._id });
      await settings.save();
    }
    
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload Profile Photo
router.post('/settings/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!req.file) return res.status(400).json({ message: 'Photo file is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get the public URL for the uploaded file
    const photoUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      photoUrl: photoUrl,
      path: photoUrl,
    });
  } catch (err) {
    console.error('Photo upload error:', err);
    res.status(500).json({ message: err.message });
  }
});


router.put('/settings', async (req, res) => {
  try {
    const { email, ...settingsData } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      settings = new Settings({ user: user._id });
    }
    
    // Update settings with provided data
    Object.keys(settingsData).forEach(key => {
      if (settingsData[key] !== undefined) {
        settings[key] = settingsData[key];
      }
    });
    
    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settings/profile', async (req, res) => {
  try {
    const { email, ...profileData } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      settings = new Settings({ user: user._id });
    }
    
    // Update profile settings
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== undefined) {
        settings.profile[key] = profileData[key];
      }
    });
    
    await settings.save();
    res.json({ message: 'Profile updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settings/theme', async (req, res) => {
  try {
    const { email, ...themeData } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      settings = new Settings({ user: user._id });
    }
    
    // Update theme settings
    Object.keys(themeData).forEach(key => {
      if (themeData[key] !== undefined) {
        settings.theme[key] = themeData[key];
      }
    });
    
    await settings.save();
    res.json({ message: 'Theme settings updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settings/notifications', async (req, res) => {
  try {
    const { email, ...notificationData } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      settings = new Settings({ user: user._id });
    }
    
    // Update notification settings
    Object.keys(notificationData).forEach(key => {
      if (notificationData[key] !== undefined) {
        settings.notifications[key] = notificationData[key];
      }
    });
    
    await settings.save();
    res.json({ message: 'Notification settings updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settings/security', async (req, res) => {
  try {
    const { email, ...securityData } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      settings = new Settings({ user: user._id });
    }
    
    // Update security settings
    Object.keys(securityData).forEach(key => {
      if (securityData[key] !== undefined) {
        settings.security[key] = securityData[key];
      }
    });
    
    await settings.save();
    res.json({ message: 'Security settings updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settings/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Email, current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put('/settings/preferences', async (req, res) => {
  try {
    const { email, ...preferenceData } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      settings = new Settings({ user: user._id });
    }
    
    // Update preference settings
    Object.keys(preferenceData).forEach(key => {
      if (preferenceData[key] !== undefined) {
        settings.preferences[key] = preferenceData[key];
      }
    });
    
    await settings.save();
    res.json({ message: 'Preferences updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settings/account', async (req, res) => {
  try {
    const { email, ...accountData } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      settings = new Settings({ user: user._id });
    }
    
    // Update account settings
    Object.keys(accountData).forEach(key => {
      if (accountData[key] !== undefined) {
        settings.account[key] = accountData[key];
      }
    });
    
    await settings.save();
    res.json({ message: 'Account settings updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settings/agricultural', async (req, res) => {
  try {
    const { email, ...agriculturalData } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      settings = new Settings({ user: user._id });
    }
    
    // Update agricultural settings
    Object.keys(agriculturalData).forEach(key => {
      if (agriculturalData[key] !== undefined) {
        if (key === 'alertPrefs') {
          Object.keys(agriculturalData[key]).forEach(prefKey => {
            if (agriculturalData[key][prefKey] !== undefined) {
              settings.agricultural.alertPrefs[prefKey] = agriculturalData[key][prefKey];
            }
          });
        } else {
          settings.agricultural[key] = agriculturalData[key];
        }
      }
    });
    
    await settings.save();
    res.json({ message: 'Agricultural profile updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== ANALYTICS ENDPOINTS ====================

// Test Analytics Endpoint
router.get('/agro/analytics/test', async (req, res) => {
  try {
    const { id, email } = req.query;
    console.log('Analytics test endpoint called with:', { id, email });
    
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    // Check if there are any orders
    const orderCount = await Order.countDocuments({ agroId: agro._id });
    const productCount = await Product.countDocuments({ ownerId: agro._id });
    
    res.json({
      message: 'Analytics test successful',
      agroId: agro._id,
      agroName: agro.agroName,
      orderCount,
      productCount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error in analytics test:', err);
    res.status(500).json({ message: err.message });
  }
});

// Generate Demo Data for Analytics
router.post('/agro/analytics/generate-demo-data', async (req, res) => {
  try {
    const { id, email } = req.body;
    console.log('Generating demo data for:', { id, email });
    
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    // Create some demo products if none exist
    const existingProducts = await Product.find({ ownerId: agro._id });
    if (existingProducts.length === 0) {
      const demoProducts = [
        { name: 'Wheat Seeds', category: 'Seed', price: 500, quantity: 100, description: 'High quality wheat seeds' },
        { name: 'Rice Seeds', category: 'Seed', price: 400, quantity: 80, description: 'Premium rice seeds' },
        { name: 'NPK Fertilizer', category: 'Fertilizer', price: 800, quantity: 50, description: 'Balanced NPK fertilizer' },
        { name: 'Tractor', category: 'Machinery', price: 50000, quantity: 2, description: 'Heavy duty tractor' },
        { name: 'Pesticide', category: 'Other', price: 300, quantity: 60, description: 'Organic pesticide' }
      ];
      
      for (const productData of demoProducts) {
        const product = new Product({
          ...productData,
          ownerId: agro._id
        });
        await product.save();
      }
    }
    
    // Create some demo orders if none exist
    const existingOrders = await Order.countDocuments({ agroId: agro._id });
    if (existingOrders === 0) {
      const products = await Product.find({ ownerId: agro._id });
      const now = new Date();
      
      // Generate orders for the last 6 months
      for (let i = 0; i < 30; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const createdAt = new Date(now.getTime() - (Math.random() * 180 * 24 * 60 * 60 * 1000)); // Last 6 months
        
        const order = new Order({
          productId: product._id,
          farmerId: new mongoose.Types.ObjectId(), // Random farmer ID
          agroId: agro._id,
          quantity: Math.floor(Math.random() * 10) + 1,
          totalPrice: product.price * (Math.floor(Math.random() * 10) + 1),
          status: ['Placed', 'Accepted', 'Shipped', 'Completed'][Math.floor(Math.random() * 4)],
          createdAt: createdAt,
          farmerName: `Farmer ${i + 1}`,
          farmerPhone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`
        });
        
        await order.save();
      }
    }
    
    res.json({
      message: 'Demo data generated successfully',
      agroId: agro._id,
      productsCreated: existingProducts.length === 0 ? 5 : 0,
      ordersCreated: existingOrders === 0 ? 30 : 0
    });
  } catch (err) {
    console.error('Error generating demo data:', err);
    res.status(500).json({ message: err.message });
  }
});

// Monthly Sales Analytics
router.get('/agro/analytics/monthly-sales', async (req, res) => {
  try {
    const { id, email, dateRange, productType, start, end } = req.query;
    console.log('Monthly sales analytics called with:', { id, email, dateRange, productType });
    
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    console.log('Found agro business:', agro.agroName, 'ID:', agro._id);

    // Build date filter
    let dateFilter = {};
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        };
        break;
      case 'thisWeek':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = { createdAt: { $gte: weekStart } };
        break;
      case 'thisMonth':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        };
        break;
      case 'last3Months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        dateFilter = { createdAt: { $gte: threeMonthsAgo } };
        break;
      case 'thisYear':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lt: new Date(now.getFullYear() + 1, 0, 1)
          }
        };
        break;
      case 'custom':
        if (start && end) {
          dateFilter = {
            createdAt: {
              $gte: new Date(start),
              $lte: new Date(end)
            }
          };
        }
        break;
    }

    // Build aggregation pipeline
    const pipeline = [
      {
        $match: {
          agroId: agro._id,
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      }
    ];

    // Add product type filter if specified
    if (productType && productType !== 'all') {
      pipeline.push({
        $match: {
          'product.category': productType
        }
      });
    }

    // Group by month and aggregate
    pipeline.push(
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          quantity: { $sum: '$quantity' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    );

    const result = await Order.aggregate(pipeline);
    console.log('Aggregation result:', result);
    
    // Format result for frontend
    const monthlyData = result.map(item => ({
      month: item._id.month,
      year: item._id.year,
      revenue: item.revenue,
      quantity: item.quantity,
      orders: item.orders
    }));

    console.log('Formatted monthly data:', monthlyData);
    res.json(monthlyData);
  } catch (err) {
    console.error('Error in monthly sales analytics:', err);
    res.status(500).json({ message: err.message });
  }
});

// Popular Products Analytics
router.get('/agro/analytics/popular-products', async (req, res) => {
  try {
    const { id, email, dateRange, productType, start, end } = req.query;
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });

    // Build date filter (same logic as monthly sales)
    let dateFilter = {};
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        };
        break;
      case 'thisWeek':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = { createdAt: { $gte: weekStart } };
        break;
      case 'thisMonth':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        };
        break;
      case 'last3Months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        dateFilter = { createdAt: { $gte: threeMonthsAgo } };
        break;
      case 'thisYear':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lt: new Date(now.getFullYear() + 1, 0, 1)
          }
        };
        break;
      case 'custom':
        if (start && end) {
          dateFilter = {
            createdAt: {
              $gte: new Date(start),
              $lte: new Date(end)
            }
          };
        }
        break;
    }

    // Build aggregation pipeline
    const pipeline = [
      {
        $match: {
          agroId: agro._id,
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      }
    ];

    // Add product type filter if specified
    if (productType && productType !== 'all') {
      pipeline.push({
        $match: {
          'product.category': productType
        }
      });
    }

    // Group by product and aggregate
    pipeline.push(
      {
        $group: {
          _id: '$productId',
          name: { $first: '$product.name' },
          category: { $first: '$product.category' },
          imagePath: { $first: '$product.imagePath' },
          revenue: { $sum: '$totalPrice' },
          quantity: { $sum: '$quantity' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    );

    const result = await Order.aggregate(pipeline);
    
    // Get top 5 and bottom 5
    const topProducts = result.slice(0, 5);
    const bottomProducts = result.slice(-5).reverse();

    res.json({
      topProducts,
      bottomProducts,
      totalProducts: result.length
    });
  } catch (err) {
    console.error('Error in popular products analytics:', err);
    res.status(500).json({ message: err.message });
  }
});

// Farmer Connections Analytics
router.get('/agro/analytics/farmer-connections', async (req, res) => {
  try {
    const { id, email, dateRange, start, end } = req.query;
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });

    // Build date filter
    let dateFilter = {};
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        };
        break;
      case 'thisWeek':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = { createdAt: { $gte: weekStart } };
        break;
      case 'thisMonth':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        };
        break;
      case 'last3Months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        dateFilter = { createdAt: { $gte: threeMonthsAgo } };
        break;
      case 'thisYear':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lt: new Date(now.getFullYear() + 1, 0, 1)
          }
        };
        break;
      case 'custom':
        if (start && end) {
          dateFilter = {
            createdAt: {
              $gte: new Date(start),
              $lte: new Date(end)
            }
          };
        }
        break;
    }

    // Get unique farmers from orders
    const farmersFromOrders = await Order.aggregate([
      {
        $match: {
          agroId: agro._id,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$farmerId',
          firstOrderDate: { $min: '$createdAt' },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'farmer'
        }
      },
      {
        $unwind: '$farmer'
      }
    ]);

    // Get unique farmers from requests
    const farmersFromRequests = await Request.aggregate([
      {
        $match: {
          agroId: agro._id
        }
      },
      {
        $group: {
          _id: '$farmerId',
          firstRequestDate: { $min: '$requestDate' }
        }
      }
    ]);

    // Combine and get unique farmers
    const allFarmerIds = new Set();
    farmersFromOrders.forEach(f => allFarmerIds.add(f._id.toString()));
    farmersFromRequests.forEach(f => allFarmerIds.add(f._id.toString()));

    // Get region-wise data
    const regionData = await Order.aggregate([
      {
        $match: {
          agroId: agro._id,
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'farmerId',
          foreignField: '_id',
          as: 'farmer'
        }
      },
      {
        $unwind: '$farmer'
      },
      {
        $group: {
          _id: '$farmer.region',
          farmerCount: { $addToSet: '$farmerId' },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $project: {
          region: '$_id',
          farmerCount: { $size: '$farmerCount' },
          orders: 1,
          revenue: 1
        }
      }
    ]);

    // Get growth data (monthly)
    const growthData = await Order.aggregate([
      {
        $match: {
          agroId: agro._id
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          uniqueFarmers: { $addToSet: '$farmerId' },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          month: '$_id.month',
          year: '$_id.year',
          totalConnections: { $size: '$uniqueFarmers' },
          orders: 1
        }
      },
      {
        $sort: { year: 1, month: 1 }
      }
    ]);

    // Calculate new connections this month
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = await Order.aggregate([
      {
        $match: {
          agroId: agro._id,
          createdAt: { $gte: thisMonth }
        }
      },
      {
        $group: {
          _id: '$farmerId',
          firstOrderThisMonth: { $min: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'orders',
          let: { farmerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$farmerId', '$$farmerId'] },
                    { $eq: ['$agroId', agro._id] },
                    { $lt: ['$createdAt', thisMonth] }
                  ]
                }
              }
            }
          ],
          as: 'previousOrders'
        }
      },
      {
        $match: {
          previousOrders: { $size: 0 }
        }
      }
    ]);

    res.json({
      summary: {
        totalFarmers: allFarmerIds.size,
        newThisMonth: newThisMonth.length,
        totalContacts: farmersFromRequests.length,
        totalOrders: farmersFromOrders.reduce((sum, f) => sum + f.totalOrders, 0)
      },
      regionData,
      growthData
    });
  } catch (err) {
    console.error('Error in farmer connections analytics:', err);
    res.status(500).json({ message: err.message });
  }
});

// Geo-Map Analytics
router.get('/agro/analytics/geo-map', async (req, res) => {
  try {
    const { id, email, dateRange, productType, start, end } = req.query;
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });

    // Build date filter
    let dateFilter = {};
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        };
        break;
      case 'thisWeek':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = { createdAt: { $gte: weekStart } };
        break;
      case 'thisMonth':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        };
        break;
      case 'last3Months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        dateFilter = { createdAt: { $gte: threeMonthsAgo } };
        break;
      case 'thisYear':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lt: new Date(now.getFullYear() + 1, 0, 1)
          }
        };
        break;
      case 'custom':
        if (start && end) {
          dateFilter = {
            createdAt: {
              $gte: new Date(start),
              $lte: new Date(end)
            }
          };
        }
        break;
    }

    // Get region-wise data with product details
    const regionData = await Order.aggregate([
      {
        $match: {
          agroId: agro._id,
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'farmerId',
          foreignField: '_id',
          as: 'farmer'
        }
      },
      {
        $unwind: '$farmer'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      }
    ]);

    // Add product type filter if specified
    let filteredData = regionData;
    if (productType && productType !== 'all') {
      filteredData = regionData.filter(item => item.product.category === productType);
    }

    // Group by region
    const regionStats = {};
    filteredData.forEach(item => {
      const region = item.farmer.region || 'Unknown';
      if (!regionStats[region]) {
        regionStats[region] = {
          region,
          farmerCount: new Set(),
          orders: 0,
          revenue: 0,
          products: {},
          browsingCount: Math.floor(Math.random() * 50) + 10 // Simulated browsing data
        };
      }
      
      regionStats[region].farmerCount.add(item.farmerId.toString());
      regionStats[region].orders += 1;
      regionStats[region].revenue += item.totalPrice;
      
      // Track top products
      const productName = item.product.name;
      if (!regionStats[region].products[productName]) {
        regionStats[region].products[productName] = 0;
      }
      regionStats[region].products[productName] += item.quantity;
    });

    // Convert to array and format
    const result = Object.values(regionStats).map(region => ({
      region: region.region,
      farmerCount: region.farmerCount.size,
      orders: region.orders,
      revenue: region.revenue,
      browsingCount: region.browsingCount,
      topProducts: Object.entries(region.products)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3),
      potentialRevenue: region.browsingCount > region.orders ? 
        (region.browsingCount - region.orders) * (region.revenue / Math.max(region.orders, 1)) : 0
    }));

    res.json(result);
  } catch (err) {
    console.error('Error in geo-map analytics:', err);
    res.status(500).json({ message: err.message });
  }
});

// Export Analytics Data
router.get('/agro/analytics/export', async (req, res) => {
  try {
    const { id, email, dateRange, productType, format = 'csv' } = req.query;
    
    // Get all analytics data
    const [monthlySales, popularProducts, farmerConnections, geoMap] = await Promise.all([
      axios.get(`${req.protocol}://${req.get('host')}/api/user/agro/analytics/monthly-sales`, {
        params: { id, email, dateRange, productType }
      }).then(r => r.data).catch(() => []),
      
      axios.get(`${req.protocol}://${req.get('host')}/api/user/agro/analytics/popular-products`, {
        params: { id, email, dateRange, productType }
      }).then(r => r.data).catch(() => ({ topProducts: [], bottomProducts: [] })),
      
      axios.get(`${req.protocol}://${req.get('host')}/api/user/agro/analytics/farmer-connections`, {
        params: { id, email, dateRange }
      }).then(r => r.data).catch(() => ({ summary: {}, regionData: [], growthData: [] })),
      
      axios.get(`${req.protocol}://${req.get('host')}/api/user/agro/analytics/geo-map`, {
        params: { id, email, dateRange, productType }
      }).then(r => r.data).catch(() => [])
    ]);

    if (format === 'csv') {
      // Generate CSV content
      let csvContent = 'Analytics Export\n\n';
      
      // Monthly Sales
      csvContent += 'Monthly Sales\n';
      csvContent += 'Month,Revenue,Quantity,Orders\n';
      monthlySales.forEach(item => {
        csvContent += `${item.month},${item.revenue},${item.quantity},${item.orders}\n`;
      });
      
      csvContent += '\nTop Products\n';
      csvContent += 'Product Name,Category,Revenue,Quantity,Orders\n';
      popularProducts.topProducts.forEach(item => {
        csvContent += `${item.name},${item.category},${item.revenue},${item.quantity},${item.orders}\n`;
      });
      
      csvContent += '\nFarmer Connections by Region\n';
      csvContent += 'Region,Farmer Count,Orders,Revenue\n';
      farmerConnections.regionData.forEach(item => {
        csvContent += `${item.region},${item.farmerCount},${item.orders},${item.revenue}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics-export.csv');
      res.send(csvContent);
    } else {
      // Return JSON for other formats
      res.json({
        monthlySales,
        popularProducts,
        farmerConnections,
        geoMap,
        exportDate: new Date().toISOString(),
        filters: { dateRange, productType }
      });
    }
  } catch (err) {
    console.error('Error in analytics export:', err);
    res.status(500).json({ message: err.message });
  }
});

// Individual Export Endpoints for each analytics component

// Export Monthly Sales Data
router.get('/agro/analytics/monthly-sales/export', async (req, res) => {
  try {
    const { id, email, dateRange, productType, format = 'csv' } = req.query;
    
    // Get agro business
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    // Build date filter
    let dateFilter = {};
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        };
        break;
      case 'thisWeek':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = { createdAt: { $gte: weekStart } };
        break;
      case 'thisMonth':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        };
        break;
      case 'last3Months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        dateFilter = { createdAt: { $gte: threeMonthsAgo } };
        break;
      case 'thisYear':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lt: new Date(now.getFullYear() + 1, 0, 1)
          }
        };
        break;
      case 'custom':
        if (req.query.start && req.query.end) {
          dateFilter = {
            createdAt: {
              $gte: new Date(req.query.start),
              $lte: new Date(req.query.end)
            }
          };
        }
        break;
    }

    // Build aggregation pipeline
    const pipeline = [
      {
        $match: {
          agroId: agro._id,
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      }
    ];

    // Add product type filter if specified
    if (productType && productType !== 'all') {
      pipeline.push({
        $match: {
          'product.category': productType
        }
      });
    }

    // Group by month and aggregate
    pipeline.push(
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          quantity: { $sum: '$quantity' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    );

    const result = await Order.aggregate(pipeline);
    
    // Format result for frontend
    const monthlyData = result.map(item => ({
      month: item._id.month,
      year: item._id.year,
      revenue: item.revenue,
      quantity: item.quantity,
      orders: item.orders
    }));
    
    if (format === 'csv') {
      let csvContent = 'Month,Revenue,Quantity,Orders\n';
      monthlyData.forEach(item => {
        csvContent += `${item.month},${item.revenue},${item.quantity},${item.orders}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=monthly-sales.csv');
      res.send(csvContent);
    } else {
      res.json(monthlyData);
    }
  } catch (err) {
    console.error('Error in monthly sales export:', err);
    res.status(500).json({ message: err.message });
  }
});

// Export Popular Products Data
router.get('/agro/analytics/popular-products/export', async (req, res) => {
  try {
    const { id, email, dateRange, productType, format = 'csv' } = req.query;
    
    // Get popular products data
    const response = await axios.get(`${req.protocol}://${req.get('host')}/api/user/agro/analytics/popular-products`, {
      params: { id, email, dateRange, productType }
    });
    
    const data = response.data;
    
    if (format === 'csv') {
      let csvContent = 'Product Name,Category,Revenue,Quantity,Orders,Type\n';
      
      // Add top products
      data.topProducts.forEach(item => {
        csvContent += `"${item.name}",${item.category},${item.revenue},${item.quantity},${item.orders},Top\n`;
      });
      
      // Add bottom products
      data.bottomProducts.forEach(item => {
        csvContent += `"${item.name}",${item.category},${item.revenue},${item.quantity},${item.orders},Bottom\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=popular-products.csv');
      res.send(csvContent);
    } else {
      res.json(data);
    }
  } catch (err) {
    console.error('Error in popular products export:', err);
    res.status(500).json({ message: err.message });
  }
});

// Export Farmer Connections Data
router.get('/agro/analytics/farmer-connections/export', async (req, res) => {
  try {
    const { id, email, dateRange, format = 'csv' } = req.query;
    
    // Get farmer connections data
    const response = await axios.get(`${req.protocol}://${req.get('host')}/api/user/agro/analytics/farmer-connections`, {
      params: { id, email, dateRange }
    });
    
    const data = response.data;
    
    if (format === 'csv') {
      let csvContent = 'Region,Farmer Count,Orders,Revenue,New This Month\n';
      data.regionData.forEach(item => {
        csvContent += `${item.region},${item.farmerCount},${item.orders},${item.revenue || 0},${item.newThisMonth || 0}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=farmer-connections.csv');
      res.send(csvContent);
    } else {
      res.json(data);
    }
  } catch (err) {
    console.error('Error in farmer connections export:', err);
    res.status(500).json({ message: err.message });
  }
});

// Export Geo Map Data
router.get('/agro/analytics/geo-map/export', async (req, res) => {
  try {
    const { id, email, dateRange, productType, format = 'csv' } = req.query;
    
    // Get geo map data
    const response = await axios.get(`${req.protocol}://${req.get('host')}/api/user/agro/analytics/geo-map`, {
      params: { id, email, dateRange, productType }
    });
    
    const data = response.data;
    
    if (format === 'csv') {
      let csvContent = 'Region,Farmer Count,Orders,Revenue,Browsing Count,Opportunity Score\n';
      data.forEach(item => {
        const opportunityScore = item.browsingCount > 0 && item.orders === 0 ? 'High' : 
                               item.browsingCount > item.orders * 2 ? 'Medium' : 'Low';
        csvContent += `${item.region},${item.farmerCount},${item.orders},${item.revenue || 0},${item.browsingCount || 0},${opportunityScore}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=geo-map.csv');
      res.send(csvContent);
    } else {
      res.json(data);
    }
  } catch (err) {
    console.error('Error in geo-map export:', err);
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
// CROP RECOMMENDATION  (POST /api/user/crop-recommend)
// Body: { N, P, K, temperature, humidity, ph, rainfall }
// Returns: { recommended: { crop, confidence, description }, alternatives: [...] }
// Based on Kaggle Crop Recommendation Dataset (22 Indian crops)
// ============================================================
const CROP_PROFILES = [
  {
    name: 'Rice',
    N: [60, 120], P: [30, 60], K: [30, 60],
    temp: [20, 35], humidity: [80, 100], ph: [5.5, 7.0], rainfall: [150, 300],
    description: 'Ideal for high-humidity, high-rainfall regions with medium NPK soil.',
  },
  {
    name: 'Maize',
    N: [60, 120], P: [40, 80], K: [30, 60],
    temp: [18, 35], humidity: [55, 80], ph: [5.5, 7.5], rainfall: [50, 120],
    description: 'Grows well in warm, moderate-rainfall conditions with balanced NPK.',
  },
  {
    name: 'Chickpea',
    N: [0, 60], P: [50, 100], K: [50, 100],
    temp: [15, 30], humidity: [15, 65], ph: [5.5, 8.0], rainfall: [30, 80],
    description: 'Drought-tolerant legume; needs low nitrogen and good phosphorus.',
  },
  {
    name: 'Kidney Beans',
    N: [0, 60], P: [60, 120], K: [14, 50],
    temp: [15, 30], humidity: [40, 80], ph: [5.5, 7.5], rainfall: [40, 100],
    description: 'Cool-season crop with high phosphorus demand.',
  },
  {
    name: 'Pigeon Peas',
    N: [0, 60], P: [50, 100], K: [14, 50],
    temp: [20, 35], humidity: [30, 80], ph: [5.0, 8.0], rainfall: [40, 150],
    description: 'Hardy legume; tolerates dry spells and poor soils.',
  },
  {
    name: 'Moth Beans',
    N: [0, 60], P: [30, 70], K: [14, 50],
    temp: [25, 40], humidity: [20, 60], ph: [5.5, 8.0], rainfall: [15, 60],
    description: 'Extremely drought-tolerant; suits arid, low-rainfall regions.',
  },
  {
    name: 'Mung Beans',
    N: [0, 60], P: [30, 70], K: [14, 50],
    temp: [25, 38], humidity: [55, 85], ph: [6.0, 7.5], rainfall: [45, 100],
    description: 'Short-duration crop; suits warm humid conditions.',
  },
  {
    name: 'Black Gram',
    N: [0, 60], P: [40, 80], K: [14, 50],
    temp: [25, 38], humidity: [60, 90], ph: [6.0, 8.0], rainfall: [50, 120],
    description: 'Warm-season pulse; needs moderate rainfall and humidity.',
  },
  {
    name: 'Lentil',
    N: [0, 40], P: [50, 100], K: [14, 50],
    temp: [10, 28], humidity: [20, 60], ph: [6.0, 8.0], rainfall: [20, 60],
    description: 'Cool-season crop; tolerates frost and dry conditions.',
  },
  {
    name: 'Pomegranate',
    N: [0, 40], P: [0, 40], K: [14, 50],
    temp: [20, 40], humidity: [20, 60], ph: [5.5, 7.5], rainfall: [10, 60],
    description: 'Drought-tolerant fruit crop; suited to semi-arid climates.',
  },
  {
    name: 'Banana',
    N: [80, 130], P: [60, 100], K: [50, 100],
    temp: [20, 35], humidity: [75, 100], ph: [5.5, 7.0], rainfall: [100, 200],
    description: 'High nutrient demand; needs warm, humid, moist conditions.',
  },
  {
    name: 'Mango',
    N: [0, 30], P: [0, 30], K: [30, 70],
    temp: [24, 38], humidity: [45, 80], ph: [5.5, 7.5], rainfall: [25, 125],
    description: 'Tropical fruit; low N, moderate K, warm and seasonally dry.',
  },
  {
    name: 'Grapes',
    N: [0, 30], P: [0, 50], K: [80, 130],
    temp: [15, 40], humidity: [40, 80], ph: [5.5, 7.5], rainfall: [10, 80],
    description: 'High potassium demand; suits Mediterranean-type dry climates.',
  },
  {
    name: 'Watermelon',
    N: [80, 130], P: [0, 40], K: [40, 70],
    temp: [23, 40], humidity: [55, 90], ph: [6.0, 7.0], rainfall: [25, 75],
    description: 'High-nitrogen summer fruit crop; warm and well-drained soils.',
  },
  {
    name: 'Muskmelon',
    N: [80, 130], P: [0, 40], K: [40, 70],
    temp: [25, 40], humidity: [80, 100], ph: [6.0, 7.5], rainfall: [20, 60],
    description: 'Warm-season melon; needs high nitrogen and moderate water.',
  },
  {
    name: 'Apple',
    N: [0, 60], P: [100, 160], K: [140, 220],
    temp: [0, 24], humidity: [80, 100], ph: [5.5, 7.0], rainfall: [100, 200],
    description: 'Cool-climate fruit; high P and K, needs cold winters.',
  },
  {
    name: 'Orange',
    N: [0, 30], P: [0, 30], K: [0, 30],
    temp: [10, 40], humidity: [90, 100], ph: [6.0, 7.5], rainfall: [60, 120],
    description: 'High-humidity citrus; tolerates a wide temperature range.',
  },
  {
    name: 'Papaya',
    N: [40, 80], P: [30, 70], K: [40, 80],
    temp: [20, 38], humidity: [70, 95], ph: [6.0, 7.0], rainfall: [100, 200],
    description: 'Tropical fruit; moderate NPK, warm and humid climate.',
  },
  {
    name: 'Coconut',
    N: [0, 30], P: [0, 30], K: [30, 80],
    temp: [20, 38], humidity: [80, 100], ph: [5.0, 8.0], rainfall: [130, 250],
    description: 'Coastal palm; high rainfall, high humidity, low N.',
  },
  {
    name: 'Cotton',
    N: [80, 130], P: [30, 60], K: [14, 50],
    temp: [24, 40], humidity: [55, 85], ph: [6.0, 8.0], rainfall: [60, 120],
    description: 'High-nitrogen fibre crop; warm, semi-arid climate preferred.',
  },
  {
    name: 'Jute',
    N: [60, 100], P: [30, 60], K: [30, 60],
    temp: [24, 38], humidity: [70, 100], ph: [6.0, 7.5], rainfall: [150, 250],
    description: 'High-humidity fibre crop; suits eastern India\'s monsoon belt.',
  },
  {
    name: 'Coffee',
    N: [80, 130], P: [0, 30], K: [30, 60],
    temp: [15, 30], humidity: [60, 100], ph: [6.0, 7.0], rainfall: [100, 300],
    description: 'Shade-grown tropical crop; high N, very humid, hilly terrain.',
  },
];

// Score a value against a [min, max] range: 1.0 = inside, gradual penalty outside
function scoreRange(value, [min, max]) {
  if (value >= min && value <= max) return 1.0;
  const span = max - min || 1;
  const distance = value < min ? (min - value) : (value - max);
  return Math.max(0, 1 - (distance / span));
}

router.post('/crop-recommend', (req, res) => {
  try {
    const {
      N = 0, P = 0, K = 0,
      temperature = 0, humidity = 0, ph = 7, rainfall = 0,
    } = req.body;

    const n = parseFloat(N);
    const p = parseFloat(P);
    const k = parseFloat(K);
    const t = parseFloat(temperature);
    const h = parseFloat(humidity);
    const pH = parseFloat(ph);
    const r = parseFloat(rainfall);

    // Validate
    if ([n, p, k, t, h, pH, r].some(isNaN)) {
      return res.status(400).json({ message: 'All fields must be numeric values.' });
    }

    // Weights: NPK are most critical, then pH and humidity, then temperature, rainfall last
    const weights = { N: 1.8, P: 1.5, K: 1.5, temp: 1.2, humidity: 1.2, ph: 1.5, rainfall: 1.0 };

    const scored = CROP_PROFILES.map(crop => {
      const raw =
        weights.N        * scoreRange(n,  crop.N) +
        weights.P        * scoreRange(p,  crop.P) +
        weights.K        * scoreRange(k,  crop.K) +
        weights.temp     * scoreRange(t,  crop.temp) +
        weights.humidity * scoreRange(h,  crop.humidity) +
        weights.ph       * scoreRange(pH, crop.ph) +
        weights.rainfall * scoreRange(r,  crop.rainfall);

      const maxScore = Object.values(weights).reduce((a, b) => a + b, 0);
      const pct = Math.round((raw / maxScore) * 100);
      return { crop: crop.name, score: pct, description: crop.description };
    });

    scored.sort((a, b) => b.score - a.score);

    const top = scored[0];
    let confidence = 'Low';
    if (top.score >= 85) confidence = 'High';
    else if (top.score >= 65) confidence = 'Medium';

    res.json({
      recommended: {
        crop: top.crop,
        score: top.score,
        confidence,
        description: top.description,
      },
      alternatives: scored.slice(1, 4).map(s => ({
        crop: s.crop,
        score: s.score,
        description: s.description,
      })),
      inputs: { N: n, P: p, K: k, temperature: t, humidity: h, ph: pH, rainfall: r },
    });
  } catch (err) {
    console.error('Crop recommendation error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ==================== MISSING CRUD ROUTES ====================

// Get Agro-Business profile by ID (moved here so /agro/:id doesn't shadow named routes)
router.get('/agro/:id', async (req, res) => {
  try {
    const agro = await AgroBusiness.findById(req.params.id).lean();
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    delete agro.passwordHash;
    res.json(agro);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Crop
router.put('/crop/:id', async (req, res) => {
  try {
    const { email, name, startDate, expectedHarvestDate, plannedBudget } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const crop = await Crop.findOne({ _id: req.params.id, user: user._id });
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    if (name) crop.name = name;
    if (startDate) crop.startDate = new Date(startDate);
    if (expectedHarvestDate) crop.expectedHarvestDate = new Date(expectedHarvestDate);
    if (plannedBudget != null) crop.plannedBudget = Number(plannedBudget);
    await crop.save();
    res.json({ message: 'Crop updated', crop });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Crop
router.delete('/crop/:id', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const deleted = await Crop.findOneAndDelete({ _id: req.params.id, user: user._id });
    if (!deleted) return res.status(404).json({ message: 'Crop not found' });
    // Also delete related expenses and alerts
    await Expense.deleteMany({ user: user._id, crop: deleted.name });
    await Alert.deleteMany({ user: user._id, crop: deleted._id });
    res.json({ message: 'Crop deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Expense
router.put('/expense/:id', async (req, res) => {
  try {
    const { email, amount, category, crop, date, note } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const expense = await Expense.findOne({ _id: req.params.id, user: user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (amount != null && !isNaN(amount) && amount > 0) expense.amount = parseFloat(amount);
    if (category && category.trim()) expense.category = category.trim();
    if (crop !== undefined) expense.crop = crop ? crop.trim() : undefined;
    if (date) expense.date = new Date(date);
    if (note !== undefined) expense.note = note ? note.trim() : undefined;
    await expense.save();
    res.json({ success: true, message: 'Expense updated', expense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Expense
router.delete('/expense/:id', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const deleted = await Expense.findOneAndDelete({ _id: req.params.id, user: user._id });
    if (!deleted) return res.status(404).json({ message: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Income
router.put('/income/:id', async (req, res) => {
  try {
    const { email, amount, category, crop, date, note } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const income = await Income.findOne({ _id: req.params.id, user: user._id });
    if (!income) return res.status(404).json({ message: 'Income not found' });
    if (amount != null && !isNaN(amount) && amount > 0) income.amount = parseFloat(amount);
    if (category && category.trim()) income.category = category.trim();
    if (crop !== undefined) income.crop = crop ? crop.trim() : undefined;
    if (date) income.date = new Date(date);
    if (note !== undefined) income.note = note ? note.trim() : undefined;
    await income.save();
    res.json({ success: true, message: 'Income updated', income });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Income
router.delete('/income/:id', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const deleted = await Income.findOneAndDelete({ _id: req.params.id, user: user._id });
    if (!deleted) return res.status(404).json({ message: 'Income not found' });
    res.json({ success: true, message: 'Income deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel / Delete an Order (by farmer)
router.delete('/order/:id', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const farmer = await User.findOne({ email });
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    const order = await Order.findOne({ _id: req.params.id, farmerId: farmer._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'Placed') return res.status(400).json({ message: 'Only Placed orders can be cancelled' });
    // Restore product quantity
    await Product.findByIdAndUpdate(order.productId, { $inc: { quantity: order.quantity } });
    await Order.findByIdAndDelete(order._id);
    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all expenses for a user (GET method alternative)
router.get('/expenses', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const expenses = await Expense.find({ user: user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all income for a user (GET method alternative)
router.get('/incomes', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const incomes = await Income.find({ user: user._id }).sort({ date: -1 });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ══════════════════════════════════════════════════════════════════════
// AI / ML ROUTES  (Feature 1-5 additions — existing routes untouched)
// ══════════════════════════════════════════════════════════════════════

// ── Feature 1: AI Agricultural Assistant ──────────────────────────────

// POST /api/user/ai/chat
router.post('/ai/chat', async (req, res) => {
  try {
    const { email, message, sessionId, context = {} } = req.body;
    if (!email || !message) return res.status(400).json({ message: 'email and message are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Enrich context with DB data
    const [recentExpenses, recentIncome] = await Promise.all([
      Expense.find({ user: user._id }).sort({ date: -1 }).limit(5),
      Income.find({ user: user._id }).sort({ date: -1 }).limit(5),
    ]);
    const totalExpenses = recentExpenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome   = recentIncome.reduce((s, i) => s + i.amount, 0);

    // Get or create conversation session
    const sid = sessionId || uuidv4();
    let conversation = await AIConversation.findOne({ userId: user._id, sessionId: sid });
    if (!conversation) {
      conversation = new AIConversation({
        userId: user._id,
        sessionId: sid,
        messages: [],
        context: { crop: context.crop, location: user.location, season: context.season },
      });
    }

    // Get response from Gemini
    const { response, source } = await aiChat(
      message,
      conversation.messages.slice(-10),
      { ...context, location: user.location, totalExpenses, totalIncome }
    );

    // Save to history
    conversation.messages.push({ role: 'user',      content: message,  timestamp: new Date() });
    conversation.messages.push({ role: 'assistant',  content: response, timestamp: new Date() });
    if (conversation.messages.length > 50) conversation.messages = conversation.messages.slice(-50);
    await conversation.save();

    res.json({ response, sessionId: sid, source });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/user/ai/history?email=&sessionId=
router.get('/ai/history', async (req, res) => {
  try {
    const { email, sessionId } = req.query;
    if (!email) return res.status(400).json({ message: 'email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let query = { userId: user._id };
    if (sessionId) query.sessionId = sessionId;

    const conversations = await AIConversation.find(query)
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Feature 2: Crop Recommendation ────────────────────────────────────

// POST /api/user/crop-recommend  (matches existing frontend call)
router.post('/crop-recommend', async (req, res) => {
  try {
    const { email, N, P, K, ph, temperature, humidity, rainfall, location, season, landArea } = req.body;
    const inputs = {
      N: Number(N), P: Number(P), K: Number(K),
      ph: Number(ph), temperature: Number(temperature),
      humidity: Number(humidity), rainfall: Number(rainfall),
      location, season, landArea: Number(landArea) || 1,
    };

    // Validate required numeric fields
    const nums = [inputs.N, inputs.P, inputs.K, inputs.ph, inputs.temperature, inputs.humidity, inputs.rainfall];
    if (nums.some(isNaN)) return res.status(400).json({ message: 'All soil/weather parameters must be valid numbers' });

    const result = await recommendCrop(inputs);

    // Save prediction if farmer is logged in
    if (email) {
      const user = await User.findOne({ email });
      if (user) {
        const pred = new CropPrediction({
          userId: user._id,
          cropName: result.recommended.crop,
          inputs,
          result: {
            score:       result.recommended.score,
            confidence:  result.recommended.confidence,
            description: result.recommended.description,
            yieldEst:    result.recommended.yieldTons,
            landArea:    inputs.landArea,
            costEst:     result.recommended.costEst,
            revenueEst:  result.recommended.revenueEst,
            profitEst:   result.recommended.profitEst,
            alternatives: result.alternatives,
          },
        });
        await pred.save();
        result.predictionId = pred._id;
      }
    }

    res.json(result);
  } catch (err) {
    console.error('Crop recommend error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── Feature 3: Yield & Profit Prediction ──────────────────────────────

// POST /api/user/crop/yield-predict
router.post('/crop/yield-predict', async (req, res) => {
  try {
    const { email, crop, landArea, season, additionalCosts = {} } = req.body;
    if (!crop) return res.status(400).json({ message: 'crop is required' });

    // Pull existing expenses from DB to integrate with prediction
    let existingExpenses = 0;
    let userId = null;
    if (email) {
      const user = await User.findOne({ email });
      if (user) {
        userId = user._id;
        const expenses = await Expense.find({ user: user._id, crop });
        existingExpenses = expenses.reduce((s, e) => s + e.amount, 0);
      }
    }

    const result = await predictYieldAndProfit({
      crop, landArea: Number(landArea) || 1, season,
      existingExpenses, additionalCosts,
    });

    // Save prediction
    if (userId) {
      const pred = new CropPrediction({
        userId,
        cropName: crop,
        inputs: { location: req.body.location, season, landArea: Number(landArea) || 1 },
        result: {
          yieldEst:   result.predictedYield,
          landArea:   Number(landArea) || 1,
          costEst:    result.predictedCost,
          revenueEst: result.predictedRevenue,
          profitEst:  result.predictedProfit,
        },
      });
      await pred.save();
      result.predictionId = pred._id;
    }

    res.json(result);
  } catch (err) {
    console.error('Yield predict error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/user/crop/predictions?email=
router.get('/crop/predictions', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const predictions = await CropPrediction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10);
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/user/crop/predictions/:id/actual — record actual harvest data
router.patch('/crop/predictions/:id/actual', async (req, res) => {
  try {
    const { email, yieldTons, revenueActual, expenseActual } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const pred = await CropPrediction.findOne({ _id: req.params.id, userId: user._id });
    if (!pred) return res.status(404).json({ message: 'Prediction not found' });

    pred.actual = {
      yieldTons: Number(yieldTons),
      revenueActual: Number(revenueActual),
      expenseActual: Number(expenseActual),
      profitActual: Number(revenueActual) - Number(expenseActual),
      recordedAt: new Date(),
    };
    pred.status = 'harvested';
    await pred.save();
    res.json({ message: 'Actual data recorded', prediction: pred });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Feature 4: Disease Detection ──────────────────────────────────────

// POST /api/user/disease/detect  (multipart/form-data with 'image' field)
router.post('/disease/detect', upload.single('image'), async (req, res) => {
  try {
    const { email } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Image file is required' });

    const imagePath = path.resolve('uploads', req.file.filename);
    const result = await detectDisease(imagePath);

    // Save to DB
    let savedResult = null;
    if (email) {
      const user = await User.findOne({ email });
      if (user) {
        const dpred = new DiseasePrediction({
          userId: user._id,
          imagePath: `/uploads/${req.file.filename}`,
          detectedCrop: result.detectedCrop,
          disease:      result.disease,
          confidence:   result.confidence,
          isHealthy:    result.isHealthy,
          symptoms:     result.symptoms,
          causes:       result.causes,
          prevention:   result.prevention,
          treatment:    result.treatment,
          nextSteps:    result.nextSteps,
          source:       result.source,
        });
        await dpred.save();
        savedResult = dpred._id;
      }
    }

    res.json({ ...result, imageUrl: `/uploads/${req.file.filename}`, detectionId: savedResult });
  } catch (err) {
    console.error('Disease detect error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/user/disease/history?email=
router.get('/disease/history', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const history = await DiseasePrediction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Feature 5: Smart Marketplace Recommendations ───────────────────────

// GET /api/user/marketplace/recommended?email=&crop=&limit=
router.get('/marketplace/recommended', async (req, res) => {
  try {
    const { email, crop = 'General', limit = 8 } = req.query;
    let farmerId = null;
    if (email) {
      const user = await User.findOne({ email });
      if (user) farmerId = user._id;
    }
    const products = await getRecommendedProducts(crop, farmerId, Number(limit));
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// Stage 3 – Digital Twin Farm Configuration Routes
// ═══════════════════════════════════════════════════════════════════════

// Derive cropType key and default color from a crop name string
function deriveCropMeta(cropName) {
  const name = (cropName || '').toLowerCase().trim();
  const cropMap = {
    wheat:     { cropType: 'wheat',     color: '#d4a847' },
    rice:      { cropType: 'rice',      color: '#7db87d' },
    paddy:     { cropType: 'rice',      color: '#7db87d' },
    sugarcane: { cropType: 'sugarcane', color: '#8bc34a' },
    cotton:    { cropType: 'cotton',    color: '#f5f5dc' },
    maize:     { cropType: 'maize',     color: '#f59e0b' },
    corn:      { cropType: 'maize',     color: '#f59e0b' },
    soybean:   { cropType: 'soybean',   color: '#a3e635' },
    tomato:    { cropType: 'tomato',    color: '#ef4444' },
    groundnut: { cropType: 'groundnut', color: '#ca8a04' },
    potato:    { cropType: 'potato',    color: '#a78bfa' },
    onion:     { cropType: 'onion',     color: '#c084fc' },
    chickpea:  { cropType: 'chickpea',  color: '#fbbf24' },
    mustard:   { cropType: 'mustard',   color: '#facc15' },
  };
  return cropMap[name] || { cropType: 'generic', color: '#6ab04c' };
}

// GET /api/user/farm-config?email=
router.get('/farm-config', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const config = await FarmConfig.findOne({ user: user._id });
    if (!config) return res.status(404).json({ message: 'No farm config found' });
    res.json(config);
  } catch (err) {
    console.error('farm-config GET error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/user/farm-config  (create or update – upsert by user)
router.post('/farm-config', async (req, res) => {
  try {
    const { email, totalArea, zones } = req.body;
    if (!email) return res.status(400).json({ message: 'email required' });
    if (!totalArea || totalArea <= 0) return res.status(400).json({ message: 'totalArea must be > 0' });
    if (!Array.isArray(zones) || zones.length === 0) return res.status(400).json({ message: 'At least 1 zone required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Validate zone areas
    for (const z of zones) {
      if (!z.name || !z.name.trim()) return res.status(400).json({ message: 'All zones must have a name' });
      if (!z.crop || !z.crop.trim()) return res.status(400).json({ message: 'All zones must have a crop' });
      if (!z.area || z.area <= 0) return res.status(400).json({ message: `Zone "${z.name}" area must be > 0` });
    }
    const allocatedArea = zones.reduce((s, z) => s + Number(z.area), 0);
    if (allocatedArea > totalArea) {
      return res.status(400).json({ message: `Allocated area (${allocatedArea.toFixed(2)} ac) exceeds total farm area (${totalArea} ac)` });
    }

    // Enrich zones with derived cropType + color
    const enrichedZones = zones.map(z => ({
      ...z,
      area:   Number(z.area),
      ...deriveCropMeta(z.crop),
    }));

    const config = await FarmConfig.findOneAndUpdate(
      { user: user._id },
      { user: user._id, totalArea: Number(totalArea), zones: enrichedZones },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ message: 'Farm config saved', config });
  } catch (err) {
    console.error('farm-config POST error:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/user/farm-config?email=  (reset farm)
router.delete('/farm-config', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await FarmConfig.findOneAndDelete({ user: user._id });
    res.json({ message: 'Farm config deleted' });
  } catch (err) {
    console.error('farm-config DELETE error:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;