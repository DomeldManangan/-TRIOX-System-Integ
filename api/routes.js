/**
 * Main API Routes Configuration
 * Centralizes all API endpoints
 */

const express = require('express');
const router = express.Router();
const paymentProcessor = require('./paymentProcessor');
const cartHandler = require('./cartHandler');
const discountHandler = require('./discountHandler');
const checkoutHandler = require('./checkoutHandler');

// ============ CART ENDPOINTS ============

/**
 * GET /api/cart/get
 * Get cart items for current user
 */
router.get('/cart/get', async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const cart = await cartHandler.getCart(userId);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/cart/add
 * Add item to cart
 */
router.post('/cart/add', async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const { item } = req.body;
    
    const result = await cartHandler.addToCart(userId, item);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/cart/remove
 * Remove item from cart
 */
router.post('/cart/remove', async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const { itemId } = req.body;
    
    const result = await cartHandler.removeFromCart(userId, itemId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/cart/update
 * Update cart item quantity
 */
router.post('/cart/update', async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const { itemId, quantity } = req.body;
    
    const result = await cartHandler.updateQuantity(userId, itemId, quantity);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/cart/clear
 * Clear entire cart
 */
router.post('/cart/clear', async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const result = await cartHandler.clearCart(userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ DISCOUNT ENDPOINTS ============

/**
 * POST /api/discount/validate
 * Validate discount code
 */
router.post('/discount/validate', async (req, res) => {
  try {
    const { code, amount } = req.body;
    const result = await discountHandler.validateCode(code, amount);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/discount/apply
 * Apply discount to order
 */
router.post('/discount/apply', async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const { code, orderData } = req.body;
    
    const result = await discountHandler.applyDiscount(userId, code, orderData);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/discount/promotions
 * Get active promotions
 */
router.get('/discount/promotions', async (req, res) => {
  try {
    const promotions = await discountHandler.getActivePromotions();
    res.json({ promotions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ CHECKOUT ENDPOINTS ============

/**
 * POST /api/checkout/save-shipping
 * Save shipping information
 */
router.post('/checkout/save-shipping', async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const shippingData = req.body;
    
    const result = await checkoutHandler.saveShipping(userId, shippingData);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/checkout/shipping
 * Get saved shipping information
 */
router.get('/checkout/shipping', async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const shipping = await checkoutHandler.getShipping(userId);
    res.json(shipping);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/checkout/calculate-shipping
 * Calculate shipping cost
 */
router.post('/checkout/calculate-shipping', async (req, res) => {
  try {
    const { shippingData, cartAmount } = req.body;
    const shippingCost = await checkoutHandler.calculateShipping(shippingData, cartAmount);
    res.json({ shippingCost });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/checkout/calculate-tax
 * Calculate tax amount
 */
router.post('/checkout/calculate-tax', async (req, res) => {
  try {
    const { subtotal, shippingData } = req.body;
    const tax = await checkoutHandler.calculateTax(subtotal, shippingData);
    res.json({ tax });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/checkout/create-order
 * Create order
 */
router.post('/checkout/create-order', async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const orderData = req.body;
    
    const result = await checkoutHandler.createOrder(userId, orderData);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/checkout/order/:orderId
 * Get order details
 */
router.get('/checkout/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await checkoutHandler.getOrder(orderId);
    res.json(order);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// ============ PAYMENT ENDPOINTS ============

/**
 * POST /api/payment/process
 * Process payment
 */
router.post('/payment/process', async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const paymentData = req.body;
    
    const result = await paymentProcessor.processPayment(paymentData);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * GET /api/payment/status/:transactionId
 * Get payment status
 */
router.get('/payment/status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    // TODO: Implementation needed
    res.json({
      transactionId,
      status: 'completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
