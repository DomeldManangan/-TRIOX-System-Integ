# Celestix Payment System API Documentation

## Overview
This API handles all payment, checkout, cart, and discount operations for the Celestix fragrance e-commerce platform. The system supports multiple payment methods including Card, Google Pay, and GCash.

## Base URL
```
/api
```

## Authentication
All endpoints (except GET endpoints) require authentication via Bearer token:
```
Authorization: Bearer {authToken}
```

---

## Cart Management

### Get Cart
**GET** `/cart/get`

Retrieves all items in the user's cart.

**Response:**
```json
{
  "userId": "user123",
  "items": [
    {
      "id": "1",
      "name": "Dior Sauvage",
      "size": "100ml",
      "price": 120.00,
      "quantity": 1,
      "image": "/assets/img/sauvage.avif"
    }
  ],
  "subtotal": 120.00,
  "shipping": 10.00,
  "tax": 10.40,
  "discount": 0,
  "total": 140.40
}
```

### Add to Cart
**POST** `/cart/add`

Adds an item to the user's cart.

**Request Body:**
```json
{
  "item": {
    "id": "1",
    "name": "Dior Sauvage",
    "size": "100ml",
    "price": 120.00,
    "quantity": 1
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart",
  "item": { /* item data */ }
}
```

### Remove from Cart
**POST** `/cart/remove`

Removes an item from the cart.

**Request Body:**
```json
{
  "itemId": "1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

### Update Quantity
**POST** `/cart/update`

Updates the quantity of a cart item.

**Request Body:**
```json
{
  "itemId": "1",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quantity updated",
  "quantity": 2
}
```

### Clear Cart
**POST** `/cart/clear`

Clears all items from the cart.

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

## Discounts & Promotions

### Validate Discount Code
**POST** `/discount/validate`

Validates a discount code and calculates discount amount.

**Request Body:**
```json
{
  "code": "SAVE10",
  "amount": 150.00
}
```

**Response (Valid):**
```json
{
  "valid": true,
  "message": "Discount applied successfully",
  "code": "SAVE10",
  "discount": 10.00,
  "type": "fixed"
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "message": "Invalid discount code"
}
```

### Available Discount Codes
| Code | Type | Value | Min Amount |
|------|------|-------|-----------|
| SAVE10 | Fixed | $10 | $0 |
| SAVE20 | Fixed | $20 | $50 |
| SUMMER15 | Percentage | 15% | $30 |
| WELCOME5 | Fixed | $5 | $0 |

### Apply Discount
**POST** `/discount/apply`

Applies a discount code to an order.

**Request Body:**
```json
{
  "code": "SAVE10",
  "orderData": {
    "subtotal": 150.00,
    "shipping": 10.00
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Discount applied successfully",
  "order": { /* updated order */ },
  "discount": 10.00
}
```

### Get Active Promotions
**GET** `/discount/promotions`

Retrieves all currently active promotions.

**Response:**
```json
{
  "promotions": [
    {
      "code": "SAVE10",
      "type": "fixed",
      "value": 10,
      "minAmount": 0
    },
    {
      "code": "SUMMER15",
      "type": "percentage",
      "value": 15,
      "minAmount": 30
    }
  ]
}
```

---

## Checkout

### Save Shipping Information
**POST** `/checkout/save-shipping`

Saves customer shipping information.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "country": "US",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90001",
  "shippingMethod": "delivery"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Shipping information saved",
  "data": { /* shipping data */ }
}
```

### Get Shipping Information
**GET** `/checkout/shipping`

Retrieves saved shipping information for current user.

**Response:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "country": "US",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90001"
}
```

### Calculate Shipping Cost
**POST** `/checkout/calculate-shipping`

Calculates shipping cost based on location and cart amount.

**Request Body:**
```json
{
  "shippingData": {
    "country": "US",
    "state": "CA"
  },
  "cartAmount": 150.00
}
```

**Response:**
```json
{
  "shippingCost": 5.00
}
```

### Calculate Tax
**POST** `/checkout/calculate-tax`

Calculates tax based on location and cart total.

**Request Body:**
```json
{
  "subtotal": 150.00,
  "shippingData": {
    "state": "CA"
  }
}
```

**Response:**
```json
{
  "tax": 10.88
}
```

### Create Order
**POST** `/checkout/create-order`

Creates an order after checkout is complete.

**Request Body:**
```json
{
  "items": [ /* cart items */ ],
  "shippingAddress": { /* shipping data */ },
  "subtotal": 150.00,
  "shipping": 5.00,
  "tax": 10.88,
  "discount": 0,
  "total": 165.88
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "orderId": "ORD-1234567890123-ABC123",
    "status": "pending",
    "items": [ /* items */ ],
    "total": 165.88,
    "createdAt": "2024-03-08T10:00:00Z"
  }
}
```

### Get Order Details
**GET** `/checkout/order/:orderId`

Retrieves details for a specific order.

**Response:**
```json
{
  "orderId": "ORD-1234567890123-ABC123",
  "status": "confirmed",
  "items": [ /* items */ ],
  "total": 165.88
}
```

---

## Payment Processing

### Process Payment
**POST** `/payment/process`

Processes payment using the selected payment method.

**Request Body (Credit Card):**
```json
{
  "paymentMethod": "card",
  "amount": 165.88,
  "cardDetails": {
    "cardNumber": "4111111111111111",
    "expiry": "12 / 25",
    "cvc": "123"
  },
  "shippingData": { /* shipping data */ }
}
```

**Request Body (Google Pay):**
```json
{
  "paymentMethod": "googlepay",
  "amount": 165.88,
  "shippingData": { /* shipping data */ }
}
```

**Request Body (GCash):**
```json
{
  "paymentMethod": "gcash",
  "amount": 165.88,
  "shippingData": { /* shipping data */ }
}
```

**Response (Success):**
```json
{
  "success": true,
  "orderId": "ORD-1234567890123-ABC123",
  "transactionId": "TXN-1234567890123-ABC123",
  "paymentMethod": "card",
  "amount": 165.88,
  "timestamp": "2024-03-08T10:00:00Z",
  "message": "Payment processed successfully"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "Payment declined. Please check your card details."
}
```

### Get Payment Status
**GET** `/payment/status/:transactionId`

Retrieves the status of a payment transaction.

**Response:**
```json
{
  "transactionId": "TXN-1234567890123-ABC123",
  "status": "completed",
  "timestamp": "2024-03-08T10:00:00Z"
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `500` - Server Error

---

## Integration Guide

### Frontend Integration Example

```javascript
// Load cart
const cart = await fetch('/api/cart/get', {
  headers: { 'Authorization': `Bearer ${authToken}` }
}).then(r => r.json());

// Validate discount
const discount = await fetch('/api/discount/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: 'SAVE10', amount: 150 })
}).then(r => r.json());

// Process payment
const payment = await fetch('/api/payment/process', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  },
  body: JSON.stringify({
    paymentMethod: 'card',
    amount: 165.88,
    cardDetails: { /* ... */ }
  })
}).then(r => r.json());
```

---

## Payment Gateway Integration

### Stripe Integration
To integrate with Stripe, set environment variables:
```
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### Google Pay Integration
Enable Google Pay in your merchant account and configure:
```
GOOGLE_MERCHANT_ID=merchant_id
```

### GCash Integration
Configure GCash API credentials:
```
GCASH_API_KEY=api_key
GCASH_API_SECRET=api_secret
GCASH_MERCHANT_ID=merchant_id
```

---

## Testing

Test credit card numbers:
- **Visa:** 4111 1111 1111 1111
- **Mastercard:** 5555 5555 5555 4444
- **Amex:** 3782 822463 10005

Use any future expiry date and any 3-4 digit CVC.

---

## Support

For API support and documentation updates, contact: api-support@celestix.com
