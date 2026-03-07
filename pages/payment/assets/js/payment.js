// ============ PAYMENT PAGE SCRIPT ============

let selectedPaymentMethod = 'card';
let paymentData = {};

// Initialize payment page
document.addEventListener('DOMContentLoaded', function() {
  loadShippingData();
  loadOrderItems();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Card number formatting
  const cardNumberInput = document.getElementById('cardNumber');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
      const value = e.target.value.replace(/\s/g, '');
      e.target.value = value.replace(/(\d{4})/g, '$1 ').trim();
      validateCardNumber(value);
    });
  }

  // Expiry date formatting
  const expiryInput = document.getElementById('expiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', function(e) {
      const value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        e.target.value = value.slice(0, 2) + ' / ' + value.slice(2, 4);
      } else {
        e.target.value = value;
      }
    });
  }

  // CVC formatting
  const cvcInput = document.getElementById('cvc');
  if (cvcInput) {
    cvcInput.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
    });
  }

  // Billing address toggle
  const sameAsShipping = document.getElementById('sameAsShipping');
  if (sameAsShipping) {
    sameAsShipping.addEventListener('change', function() {
      const billingSection = document.getElementById('billingSection');
      billingSection.style.display = this.checked ? 'none' : 'block';
    });
  }
}

// Load shipping data from session
function loadShippingData() {
  const shippingData = JSON.parse(sessionStorage.getItem('shippingData') || '{}');
  
  if (Object.keys(shippingData).length > 0) {
    document.getElementById('shippingName').textContent = shippingData.fullName || 'John Doe';
    document.getElementById('shippingEmail').textContent = shippingData.email || 'customer@example.com';
    document.getElementById('shippingPhone').textContent = shippingData.phone || '+1 (555) 123-4567';
    document.getElementById('shippingAddress').textContent = 
      `${shippingData.city || ''}, ${shippingData.state || ''} ${shippingData.zipCode || ''}`;
  }
}

// Load order items
async function loadOrderItems() {
  try {
    const response = await fetch('/api/cart/get', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      displayOrderItems(data.items);
      updateOrderTotals(data);
    }
  } catch (error) {
    console.error('Error loading order items:', error);
  }
}

// Display order items
function displayOrderItems(items) {
  const orderItemsContainer = document.getElementById('orderItems');
  if (!items || items.length === 0) return;

  orderItemsContainer.innerHTML = '';
  items.forEach(item => {
    const itemHTML = `
      <div class="order-item">
        <div class="item-preview">
          <img src="${item.image || '../../assets/img/sauvage.avif'}" alt="${item.name}">
        </div>
        <div class="item-info">
          <h4>${item.name}</h4>
          <p>${item.size || '100ml'}</p>
          <p class="price">$${(item.price * item.quantity).toFixed(2)}</p>
        </div>
      </div>
    `;
    orderItemsContainer.innerHTML += itemHTML;
  });
}

// Update order totals
function updateOrderTotals(data) {
  const subtotal = data.subtotal || 120.00;
  const shipping = data.shipping || 10.00;
  const tax = (subtotal * 0.08).toFixed(2); // 8% tax
  const total = (parseFloat(subtotal) + parseFloat(shipping) + parseFloat(tax)).toFixed(2);

  document.getElementById('finalSubtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('finalShipping').textContent = `$${shipping.toFixed(2)}`;
  document.getElementById('finalTax').textContent = `$${tax}`;
  document.getElementById('finalTotal').textContent = `$${total}`;
}

// Select payment method
function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  
  // Update UI
  document.querySelectorAll('.payment-method').forEach(el => {
    el.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');

  // Show/hide card details based on selection
  const cardDetailsSection = document.getElementById('cardDetailsSection');
  if (method === 'card') {
    cardDetailsSection.style.display = 'block';
  } else {
    cardDetailsSection.style.display = 'none';
  }
}

// Validate card number (Luhn algorithm)
function validateCardNumber(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// Validate payment form
function validatePaymentForm() {
  if (selectedPaymentMethod === 'card') {
    const cardNumber = document.getElementById('cardNumber').value;
    const expiry = document.getElementById('expiry').value;
    const cvc = document.getElementById('cvc').value;

    if (!cardNumber || !expiry || !cvc) {
      alert('Please fill in all card details');
      return false;
    }

    if (!validateCardNumber(cardNumber)) {
      alert('Invalid card number');
      return false;
    }

    const [month, year] = expiry.split('/').map(s => s.trim());
    if (!month || !year || month < 1 || month > 12) {
      alert('Invalid expiry date');
      return false;
    }

    if (cvc.length < 3 || cvc.length > 4) {
      alert('Invalid CVC');
      return false;
    }
  }

  return true;
}

// Go back to checkout
function goBackToCheckout() {
  window.location.href = './checkout.html';
}

// Process payment
async function processPayment() {
  if (!validatePaymentForm()) {
    return;
  }

  // Show loading overlay
  const loadingOverlay = document.getElementById('loadingOverlay');
  loadingOverlay.classList.add('active');

  try {
    // Prepare payment data
    paymentData = {
      paymentMethod: selectedPaymentMethod,
      amount: document.getElementById('finalTotal').textContent.replace('$', ''),
      shippingData: JSON.parse(sessionStorage.getItem('shippingData') || '{}')
    };

    // Add method-specific data
    if (selectedPaymentMethod === 'card') {
      paymentData.cardDetails = {
        cardNumber: document.getElementById('cardNumber').value.replace(/\s/g, ''),
        expiry: document.getElementById('expiry').value,
        cvc: document.getElementById('cvc').value
      };
    }

    // Call payment API
    const response = await fetch('/api/payment/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Payment successful
      loadingOverlay.classList.remove('active');
      alert('Payment successful! Thank you for your order.');
      
      // Clear session storage
      sessionStorage.removeItem('shippingData');
      
      // Redirect to order confirmation or home page
      window.location.href = `./confirmation.html?orderId=${result.orderId}`;
    } else {
      loadingOverlay.classList.remove('active');
      alert(result.message || 'Payment failed. Please try again.');
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    loadingOverlay.classList.remove('active');
    alert('Error processing payment. Please try again.');
  }
}

// Format currency display
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}
