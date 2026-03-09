// ============ CHECKOUT PAGE SCRIPT ============

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
  loadCartItems();
});

// Format card number with spaces
function formatCardNumber(value) {
  return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
}

// Format expiry date
function formatExpiry(value) {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + ' / ' + cleaned.slice(2, 4);
  }
  return cleaned;
}

// Load cart items from API
async function loadCartItems() {
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
      displayCartItems(data.items);
      updateOrderSummary(data);
    } else {
      console.log('Using default cart items');
      // Use default data if API fails
    }
  } catch (error) {
    console.error('Error loading cart:', error);
  }
}

// Display cart items
function displayCartItems(items) {
  const cartItemsContainer = document.getElementById('cartItems');
  if (!items || items.length === 0) return;

  cartItemsContainer.innerHTML = '';
  items.forEach(item => {
    const itemHTML = `
      <div class="cart-item">
        <div class="item-image">
          <img src="${item.image || '../../assets/img/sauvage.avif'}" alt="${item.name}">
        </div>
        <div class="item-details">
          <h4>${item.name}</h4>
          <p>${item.quantity}x</p>
        </div>
        <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `;
    cartItemsContainer.innerHTML += itemHTML;
  });
}

// Update order summary
function updateOrderSummary(data) {
  const subtotal = data.subtotal || 120.00;
  const shipping = data.shipping || 10.00;
  const discount = data.discount || 0;
  const total = subtotal + shipping - discount;

  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
  document.getElementById('total').textContent = `$${total.toFixed(2)}`;

  if (discount > 0) {
    document.getElementById('discountRow').style.display = 'flex';
    document.getElementById('discount').textContent = `-$${discount.toFixed(2)}`;
  }
}

// Apply discount code
async function applyDiscount() {
  const discountCode = document.getElementById('discountCode').value.trim();
  
  if (!discountCode) {
    alert('Please enter a discount code');
    return;
  }

  try {
    const response = await fetch('/api/discount/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: discountCode
      })
    });

    const data = await response.json();

    if (response.ok && data.valid) {
      // Apply discount
      const discountAmount = data.discount;
      const currentTotal = parseFloat(document.getElementById('total').textContent.replace('$', ''));
      const newTotal = currentTotal - discountAmount;

      document.getElementById('discountRow').style.display = 'flex';
      document.getElementById('discount').textContent = `-$${discountAmount.toFixed(2)}`;
      document.getElementById('total').textContent = `$${newTotal.toFixed(2)}`;

      alert(`Discount applied! You saved $${discountAmount.toFixed(2)}`);
      document.getElementById('discountCode').disabled = true;
    } else {
      alert(data.message || 'Invalid discount code');
    }
  } catch (error) {
    console.error('Error applying discount:', error);
    alert('Error applying discount. Please try again.');
  }
}

// Validate checkout form
function validateCheckoutForm() {
  const form = document.getElementById('checkoutForm');
  
  if (!form.reportValidity()) {
    return false;
  }

  const termsCheckbox = document.getElementById('terms');
  if (!termsCheckbox.checked) {
    alert('Please agree to the Terms and Conditions');
    return false;
  }

  return true;
}

// Proceed to payment
async function proceedToPayment() {
  if (!validateCheckoutForm()) {
    return;
  }

  // Collect form data
  const formData = new FormData(document.getElementById('checkoutForm'));
  const shippingData = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('countryCode') + formData.get('phone'),
    country: formData.get('country'),
    city: formData.get('city'),
    state: formData.get('state'),
    zipCode: formData.get('zipCode'),
    shippingMethod: document.querySelector('input[name="shipping"]:checked').value
  };

  try {
    // Save shipping information to session/API
    const response = await fetch('/api/checkout/save-shipping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(shippingData)
    });

    if (response.ok) {
      // Store data locally for next page
      sessionStorage.setItem('shippingData', JSON.stringify(shippingData));
      // Redirect to payment page
      window.location.href = './payment.html';
    } else {
      alert('Error saving shipping information. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    // Still proceed if API fails (for demo)
    sessionStorage.setItem('shippingData', JSON.stringify(shippingData));
    window.location.href = './payment.html';
  }
}
