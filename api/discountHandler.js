/**
 * Discount API Handler
 * Manages discount codes and promotions
 */

const discountHandler = {
  // Mock discount codes database
  discountCodes: {
    'SAVE10': { discount: 10, type: 'fixed', minAmount: 0, active: true },
    'SAVE20': { discount: 20, type: 'fixed', minAmount: 50, active: true },
    'SUMMER15': { discount: 15, type: 'percentage', minAmount: 30, active: true },
    'WELCOME5': { discount: 5, type: 'fixed', minAmount: 0, active: true }
  },

  /**
   * Validate discount code
   * @param {String} code - Discount code
   * @param {Number} cartAmount - Cart amount
   * @returns {Promise<Object>} - Validation result
   */
  async validateCode(code, cartAmount = 0) {
    try {
      const upperCode = code.toUpperCase().trim();
      const codeData = this.discountCodes[upperCode];

      if (!codeData) {
        return {
          valid: false,
          message: 'Invalid discount code'
        };
      }

      if (!codeData.active) {
        return {
          valid: false,
          message: 'This discount code is no longer active'
        };
      }

      if (cartAmount < codeData.minAmount) {
        return {
          valid: false,
          message: `Minimum order amount of $${codeData.minAmount} required`
        };
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (codeData.type === 'fixed') {
        discountAmount = codeData.discount;
      } else if (codeData.type === 'percentage') {
        discountAmount = (cartAmount * codeData.discount) / 100;
      }

      return {
        valid: true,
        message: 'Discount applied successfully',
        code: upperCode,
        discount: discountAmount,
        type: codeData.type,
        value: codeData.discount
      };
    } catch (error) {
      console.error('Error validating discount:', error);
      throw error;
    }
  },

  /**
   * Apply discount to order
   * @param {String} userId - User ID
   * @param {String} code - Discount code
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} - Updated order with discount
   */
  async applyDiscount(userId, code, orderData) {
    try {
      const validation = await this.validateCode(code, orderData.subtotal);

      if (!validation.valid) {
        return validation;
      }

      const updatedOrder = {
        ...orderData,
        discountCode: code,
        discount: validation.discount,
        total: orderData.subtotal + orderData.shipping - validation.discount
      };

      return {
        success: true,
        message: 'Discount applied successfully',
        order: updatedOrder,
        discount: validation.discount
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get active promotions
   * @returns {Promise<Array>} - List of active promotions
   */
  async getActivePromotions() {
    try {
      const promotions = [];
      
      for (const [code, data] of Object.entries(this.discountCodes)) {
        if (data.active) {
          promotions.push({
            code: code,
            type: data.type,
            value: data.value,
            minAmount: data.minAmount
          });
        }
      }

      return promotions;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = discountHandler;
