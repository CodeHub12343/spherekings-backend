/**
 * Payout Service
 * Business logic for affiliate payout operations
 *
 * Responsibilities:
 * - Process payout requests
 * - Validate payout eligibility
 * - Manage approval workflow
 * - Handle balance deductions
 * - Track payout history
 */

const Payout = require('../models/Payout');
const User = require('../models/User');
const Commission = require('../models/Commission');
const { ValidationError, NotFoundError, ServerError } = require('../utils/errors');

class PayoutService {
  /**
   * Request payout from affiliate
   *
   * Flow:
   * 1. Validate affiliate identity
   * 2. Check available balance
   * 3. Verify payout eligibility
   * 4. Create payout request record
   * 5. Return confirmation
   *
   * @param {string} affiliateId - Affiliate requesting payout
   * @param {number} amount - Amount to withdraw
   * @param {string} method - Payment method (bank_transfer, paypal, stripe, etc.)
   * @param {object} beneficiary - Beneficiary payment details
   * @param {string} notes - Affiliate notes
   * @returns {Promise<Payout>} Created payout record
   */
  async requestPayout(affiliateId, amount, method, beneficiary, notes = '') {
    try {
      const Affiliate = require('../models/Affiliate');
      
      // Step 1: Validate affiliate exists (accepting Affiliate ID)
      let affiliateObj = await Affiliate.findById(affiliateId);
      
      // Fallback: try looking up by userId if not found by _id
      if (!affiliateObj) {
        affiliateObj = await Affiliate.findOne({ userId: affiliateId });
      }

      if (!affiliateObj) {
        throw new NotFoundError('Affiliate not found');
      }

      // Get the user associated with this affiliate
      const affiliate = await User.findById(affiliateObj.userId);

      if (!affiliate) {
        throw new NotFoundError('User account not found for affiliate');
      }

      // In development, auto-activate affiliates for testing convenience
      if (process.env.NODE_ENV === 'development' && (!affiliate.affiliateStatus || affiliate.affiliateStatus !== 'active')) {
        console.log(`⚙️ [DEV] Auto-activating affiliate ${affiliate.email} for payout testing`);
        await User.findByIdAndUpdate(affiliate._id, { affiliateStatus: 'active' });
      } else if (!affiliate.affiliateStatus || affiliate.affiliateStatus !== 'active') {
        const status = affiliate.affiliateStatus || 'undefined';
        throw new ValidationError(
          `Affiliate account is not active. Current status: '${status}'. ` +
          `Please contact support or verify your account.`
        );
      }

      // Step 2: Validate amount
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new ValidationError('Payout amount must be a positive number');
      }

      // Check minimum payout threshold ($50)
      const MINIMUM_PAYOUT = 50;
      if (amount < MINIMUM_PAYOUT) {
        throw new ValidationError(
          `Minimum payout amount is $${MINIMUM_PAYOUT}. Requested: $${amount}`
        );
      }

      // Step 3: Check available balance
      // Use the affiliate record already loaded above

      // Calculate available balance from approved commissions (same as authService)
      const approvedCommissions = await Commission.find({
        affiliateId: affiliateObj._id,
        status: 'approved'
      }).select('calculation.amount');

      const availableBalance = approvedCommissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);

      console.log(`💰 [PAYOUT] Affiliate ${affiliateId} available balance: $${availableBalance}`);

      // Check if user has met minimum balance requirement
      const MINIMUM_AVAILABLE_BALANCE = 50;
      if (availableBalance < MINIMUM_AVAILABLE_BALANCE) {
        throw new ValidationError(
          `Minimum available balance required is $${MINIMUM_AVAILABLE_BALANCE}. ` +
          `Current balance: $${(Math.round(availableBalance * 100) / 100).toFixed(2)}. ` +
          `Please earn more commissions before requesting a payout.`
        );
      }

      if (amount > availableBalance) {
        throw new ValidationError(
          `Insufficient balance. Available: $${(Math.round(availableBalance * 100) / 100).toFixed(2)}, Requested: $${amount}`
        );
      }

      // Step 4: Check for fraud flags
      if (affiliate.fraud?.flagged) {
        throw new ValidationError(
          'Cannot process payout for account with fraud flags. Contact support.'
        );
      }

      // Step 5: Validate payment method
      const validMethods = ['bank_transfer', 'paypal', 'stripe', 'cryptocurrency', 'manual'];
      if (!validMethods.includes(method)) {
        throw new ValidationError(`Invalid payment method: ${method}`);
      }

      // Step 6: Validate beneficiary details based on method
      this._validateBeneficiary(method, beneficiary);

      // Step 7: Create payout request
      const payout = await Payout.create({
        affiliateId: affiliateObj._id.toString(),
        amount,
        method,
        status: 'pending',
        request: {
          submittedAt: new Date(),
          notes,
          beneficiary: this._encryptBeneficiary(beneficiary)
        },
        statusHistory: [
          {
            status: 'pending',
            changedAt: new Date(),
            reason: 'Payout request submitted by affiliate'
          }
        ]
      });

      console.log(`✅ Payout requested: ${payout._id}`);
      console.log(`   Affiliate: ${affiliateObj._id}`);
      console.log(`   Amount: $${amount}`);
      console.log(`   Method: ${method}`);

      return payout;
    } catch (error) {
      console.error('Payout request failed:', error.message);
      if (error.name === 'ValidationError' || error.name === 'NotFoundError') {
        throw error;
      }
      throw new ServerError(`Failed to request payout: ${error.message}`);
    }
  }

  /**
   * Approve payout (admin only)
   *
   * Flow:
   * 1. Validate payout is pending
   * 2. Verify amount against current balance
   * 3. Update payout status to approved
   * 4. Store approval metadata
   * 5. DO NOT deduct balance yet (deduct on processing)
   *
   * @param {string} payoutId - Payout ID
   * @param {string} adminId - Admin user ID
   * @param {string} notes - Approval notes
   * @returns {Promise<Payout>} Updated payout
   */
  async approvePayout(payoutId, adminId, notes = '') {
    try {
      // Step 1: Find payout
      const payout = await Payout.findById(payoutId);

      if (!payout) {
        throw new NotFoundError('Payout not found');
      }

      // Step 2: Validate status is pending
      if (payout.status !== 'pending') {
        throw new ValidationError(
          `Cannot approve payout with status: ${payout.status}. Only pending payouts can be approved.`
        );
      }

      // Step 3: Approve payout (balance will be checked during processing)
      payout.approve(adminId, notes);
      await payout.save();

      console.log(`✅ Payout approved: ${payout._id}`);
      console.log(`   Admin: ${adminId}`);
      console.log(`   Amount: $${payout.amount}`);

      return payout;
    } catch (error) {
      console.error('Payout approval failed:', error.message);
      if (error.name === 'ValidationError' || error.name === 'NotFoundError') {
        throw error;
      }
      throw new ServerError(`Failed to approve payout: ${error.message}`);
    }
  }

  /**
   * Mark payout as paid (manual payment)
   *
   * Admin manually processed the payment outside system
   * This just records it in the system with receipt proof
   *
   * Flow:
   * 1. Validate payout is approved
   * 2. Record payment details (receipt ID, transaction ID)
   * 3. Mark as paid
   * 4. Complete
   *
   * @param {string} payoutId - Payout ID
   * @param {string} receiptId - Receipt/proof of payment
   * @param {string} transactionId - Optional transaction ID
   * @returns {Promise<Payout>} Updated payout
   */
  async markPayoutAsPaid(payoutId, receiptId, transactionId = null) {
    try {
      // Step 1: Find payout
      const payout = await Payout.findById(payoutId);

      if (!payout) {
        throw new NotFoundError('Payout not found');
      }

      console.log(`\n🔵 [PAYOUT PAID] Processing payout #${payout._id}`);
      console.log(`   Affiliate ID: ${payout.affiliateId}`);
      console.log(`   Payout Amount: $${payout.amount}`);
      console.log(`   Current Status: ${payout.status}`);

      // Step 2: Validate status is approved
      if (payout.status !== 'approved') {
        throw new ValidationError(
          `Cannot process payout with status: ${payout.status}. Only approved payouts can be marked as paid.`
        );
      }

      // Step 3: Require receipt ID
      if (!receiptId || receiptId.trim() === '') {
        throw new ValidationError('Receipt ID is required to mark payout as paid');
      }

      // Step 4: Mark associated commissions as paid to deduct from available balance
      // Get the oldest approved commissions for this affiliate
      const approvedCommissions = await Commission.find({
        affiliateId: payout.affiliateId,
        status: 'approved'
      }).sort({ createdAt: 1 });

      console.log(`\n   📋 Found ${approvedCommissions.length} approved commissions for affiliate`);
      if (approvedCommissions.length > 0) {
        approvedCommissions.forEach((c, idx) => {
          console.log(`      [${idx + 1}] Commission ${c._id}: $${c.calculation?.amount || 0}`);
        });
      }

      let remainingAmount = payout.amount;
      const commissionIds = [];
      const markedCommissions = [];

      for (const commission of approvedCommissions) {
        if (remainingAmount <= 0) {
          console.log(`      ⏹️  Stopping: Remaining amount exhausted ($${remainingAmount})`);
          break;
        }
        
        const commissionAmount = commission.calculation?.amount || 0;
        
        console.log(`      Processing: ${commission._id} ($${commissionAmount}) | Remaining: $${remainingAmount}`);
        
        if (commissionAmount <= remainingAmount) {
          // Mark entire commission as paid
          commission.status = 'paid';
          commissionIds.push(commission._id);
          markedCommissions.push({ id: commission._id, amount: commissionAmount });
          remainingAmount -= commissionAmount;
          const saved = await commission.save();
          console.log(`      ✅ MARKED AS PAID: ${commission._id} | New Status: ${saved.status}`);
        } else {
          // PARTIAL PAYMENT: Commission is larger than remaining amount
          // Reduce commission amount by the payout amount and mark as partially paid
          const paidAmount = remainingAmount;
          const unpaidAmount = commissionAmount - paidAmount;
          
          commission.calculation = commission.calculation || {};
          commission.calculation.amount = unpaidAmount;  // Reduce amount to unpaid portion
          commission.status = 'approved';  // Keep as approved for the remaining balance
          
          markedCommissions.push({ id: commission._id, amount: paidAmount });
          commissionIds.push(commission._id);
          
          const saved = await commission.save();
          console.log(`      ✅ PARTIAL PAYMENT: ${commission._id}`);
          console.log(`         Paid: $${paidAmount} | Remaining: $${unpaidAmount}`);
          console.log(`         New Status: ${saved.status} | New Amount: $${saved.calculation?.amount}`);
          
          remainingAmount = 0;  // Payout amount fully allocated
        }
      }

      console.log(`\n   📊 Summary: Marked ${commissionIds.length} commissions as paid`);
      if (markedCommissions.length > 0) {
        markedCommissions.forEach(m => console.log(`      - ${m.id}: $${m.amount}`));
      }
      console.log(`   💰 Total marked: $${payout.amount - remainingAmount} of $${payout.amount}`);

      // Step 5: Record payment with receipt proof
      if (!payout.payment) {
        payout.payment = {};
      }

      payout.payment.receiptId = receiptId;
      payout.payment.transactionId = transactionId || `MANUAL-${Date.now()}`;
      payout.payment.paidAt = new Date();
      payout.payment.method = 'manual';

      // Step 6: Mark as paid (update status)
      payout.status = 'paid';
      payout.statusHistory.push({
        status: 'paid',
        changedAt: new Date(),
        reason: 'Admin marked as paid (manual payment)'
      });

      const savedPayout = await payout.save();

      console.log(`\n✅ [PAYOUT COMPLETE] Payout ${payout._id} marked as PAID`);
      console.log(`   Status: ${savedPayout.status}`);
      console.log(`   Receipt ID: ${receiptId}`);
      console.log(`   Commissions Updated: ${commissionIds.length}\n`);
      console.log(`   Receipt ID: ${receiptId}`);
      console.log(`   Transaction ID: ${payout.payment.transactionId}`);

      return payout;
    } catch (error) {
      console.error('Marking payout as paid failed:', error.message);
      if (error.name === 'ValidationError' || error.name === 'NotFoundError') {
        throw error;
      }
      throw new ServerError(`Failed to mark payout as paid: ${error.message}`);
    }
  }

  /**
   * Process payout (admin payment submission) - DEPRECATED
   * Use markPayoutAsPaid() instead for manual payments
   *
   * @param {string} payoutId - Payout ID
   * @param {string} stripeConnectId - Optional Stripe Connect ID
   * @returns {Promise<Payout>} Updated payout
   */
  async processPayout(payoutId, stripeConnectId = null) {
    const session = await Payout.startSession();
    session.startTransaction();

    try {
      // Step 1: Find payout
      const payout = await Payout.findById(payoutId).session(session);

      if (!payout) {
        throw new NotFoundError('Payout not found');
      }

      // Step 2: Validate status is approved
      if (payout.status !== 'approved') {
        throw new ValidationError(
          `Cannot process payout with status: ${payout.status}. Only approved payouts can be processed.`
        );
      }

      // Step 3: Mark as processing
      payout.markAsProcessing();

      // Step 4: Get affiliate and deduct balance
      const affiliate = await User.findById(payout.affiliateId).session(session);

      if (!affiliate) {
        throw new NotFoundError('Affiliate not found');
      }

      // Deduct from available balance
      const previousBalance = affiliate.affiliateDetails?.availableBalance || 0;

      if (payout.amount > previousBalance) {
        throw new ValidationError('Insufficient balance for payout processing');
      }

      affiliate.affiliateDetails.availableBalance = previousBalance - payout.amount;
      affiliate.affiliateDetails.totalPaidOut =
        (affiliate.affiliateDetails.totalPaidOut || 0) + payout.amount;

      // Step 5: Store reconciliation info
      payout.reconciliation = {
        deductedFrom: {
          availableBalance: previousBalance
        },
        deductedAt: new Date()
      };

      // Step 6: Submit to payment provider
      let transactionId;
      try {
        transactionId = await this._submitPaymentToProvider(payout, stripeConnectId);

        // Mark as completed
        payout.markAsCompleted(transactionId);
      } catch (paymentError) {
        // Mark as failed, restore balance
        payout.markAsFailed('payment_provider_error', paymentError.message);
        affiliate.affiliateDetails.availableBalance = previousBalance;
        affiliate.affiliateDetails.totalPaidOut -= payout.amount;

        await payout.save({ session });
        await affiliate.save({ session });
        await session.abortTransaction();

        throw paymentError;
      }

      // Step 7: Save changes
      await payout.save({ session });
      await affiliate.save({ session });
      await session.commitTransaction();

      console.log(`✅ Payout processed: ${payout._id}`);
      console.log(`   Amount: $${payout.amount}`);
      console.log(`   Affiliate balance: $${affiliate.affiliateDetails.availableBalance}`);

      return payout;
    } catch (error) {
      await session.abortTransaction();
      console.error('Payout processing failed:', error.message);
      if (error.name === 'ValidationError' || error.name === 'NotFoundError') {
        throw error;
      }
      throw new ServerError(`Failed to process payout: ${error.message}`);
    } finally {
      await session.endSession();
    }
  }

  /**
   * Reject/cancel payout
   *
   * Can cancel pending or approved payouts
   * Cannot cancel completed, failed, or already cancelled
   *
   * @param {string} payoutId - Payout ID
   * @param {string} adminId - Admin cancelling
   * @param {string} reason - Cancellation reason
   * @param {string} details - Additional details
   * @returns {Promise<Payout>} Updated payout
   */
  async rejectPayout(payoutId, adminId, reason, details = '') {
    try {
      // Step 1: Find payout
      const payout = await Payout.findById(payoutId);

      if (!payout) {
        throw new NotFoundError('Payout not found');
      }

      // Step 2: Validate can be cancelled
      if (!['pending', 'approved'].includes(payout.status)) {
        throw new ValidationError(
          `Cannot cancel payout with status: ${payout.status}`
        );
      }

      // Step 3: Cancel payout
      payout.cancel(adminId, reason, details);
      await payout.save();

      console.log(`✅ Payout cancelled: ${payout._id}`);
      console.log(`   Reason: ${reason}`);

      return payout;
    } catch (error) {
      console.error('Payout rejection failed:', error.message);
      if (error.name === 'ValidationError' || error.name === 'NotFoundError') {
        throw error;
      }
      throw new ServerError(`Failed to reject payout: ${error.message}`);
    }
  }

  /**
   * Get payouts for affiliate
   *
   * @param {string} affiliateId - Affiliate ID
   * @param {object} options - { page, limit, status, dateFrom, dateTo }
   * @returns {Promise<{payouts: array, pagination: object}>}
   */
  async getAffiliatePayouts(affiliateId, options = {}) {
    try {
      return await Payout.getAffiliatePayouts(affiliateId, options);
    } catch (error) {
      throw new ServerError(`Failed to retrieve affiliate payouts: ${error.message}`);
    }
  }

  /**
   * Get payout statistics for affiliate
   *
   * @param {string} affiliateId - Affiliate ID
   * @returns {Promise<object>}
   */
  async getAffiliatePayoutStats(affiliateId) {
    try {
      return await Payout.getAffiliatePayoutStats(affiliateId);
    } catch (error) {
      throw new ServerError(`Failed to retrieve payout stats: ${error.message}`);
    }
  }

  /**
   * Get all pending payouts (admin queue)
   *
   * @param {object} options - { limit, dateFrom, dateTo }
   * @returns {Promise<array>}
   */
  async getPendingPayouts(options = {}) {
    try {
      return await Payout.getPendingPayouts(options);
    } catch (error) {
      throw new ServerError(`Failed to retrieve pending payouts: ${error.message}`);
    }
  }

  /**
   * Get payouts ready for processing
   *
   * @param {object} options - { limit }
   * @returns {Promise<array>}
   */
  async getReadyForProcessing(options = {}) {
    try {
      return await Payout.getReadyForProcessing(options);
    } catch (error) {
      throw new ServerError(`Failed to retrieve payouts ready for processing: ${error.message}`);
    }
  }

  /**
   * Get system-wide payout statistics
   *
   * @param {object} options - { dateFrom, dateTo }
   * @returns {Promise<object>}
   */
  async getSystemStats(options = {}) {
    try {
      return await Payout.getSystemStats(options);
    } catch (error) {
      throw new ServerError(`Failed to retrieve system payout stats: ${error.message}`);
    }
  }

  /**
   * Batch approve payouts
   *
   * @param {array} payoutIds - Array of payout IDs
   * @param {string} adminId - Admin user ID
   * @param {string} notes - Approval notes
   * @returns {Promise<{approved: array, failed: array, total: number}>}
   */
  async batchApprovePayout(payoutIds, adminId, notes = '') {
    const approved = [];
    const failed = [];

    for (const payoutId of payoutIds) {
      try {
        await this.approvePayout(payoutId, adminId, notes);
        approved.push(payoutId);
      } catch (error) {
        failed.push({
          payoutId,
          error: error.message
        });
      }
    }

    return {
      approved,
      failed,
      total: payoutIds.length
    };
  }

  /**
   * Batch process payouts
   *
   * @param {array} payoutIds - Array of payout IDs
   * @param {string} stripeConnectId - Optional Stripe Connect ID
   * @returns {Promise<{processed: array, failed: array, total: number, totalAmount: number}>}
   */
  async batchProcessPayout(payoutIds, stripeConnectId = null) {
    const processed = [];
    const failed = [];
    let totalAmount = 0;

    for (const payoutId of payoutIds) {
      try {
        const payout = await this.processPayout(payoutId, stripeConnectId);
        processed.push(payoutId);
        totalAmount += payout.amount;
      } catch (error) {
        failed.push({
          payoutId,
          error: error.message
        });
      }
    }

    return {
      processed,
      failed,
      total: payoutIds.length,
      totalAmount
    };
  }

  /**
   * ==================== PRIVATE HELPER METHODS ====================
   */

  /**
   * Validate beneficiary payment details by method
   *
   * @private
   * @param {string} method - Payment method
   * @param {object} beneficiary - Beneficiary details
   * @throws {ValidationError} If validation fails
   */
  _validateBeneficiary(method, beneficiary) {
    if (!beneficiary) {
      throw new ValidationError('Beneficiary payment details required');
    }

    switch (method) {
      case 'bank_transfer':
        if (!beneficiary.accountHolderName || !beneficiary.accountNumber || !beneficiary.bankName) {
          throw new ValidationError(
            'Bank transfer requires: accountHolderName, accountNumber, bankName'
          );
        }
        break;

      case 'paypal':
        if (!beneficiary.email) {
          throw new ValidationError('PayPal payout requires email address');
        }
        break;

      case 'stripe':
        if (!beneficiary.stripeConnectId) {
          throw new ValidationError('Stripe payout requires Stripe Connect ID');
        }
        break;

      case 'cryptocurrency':
        if (!beneficiary.walletAddress) {
          throw new ValidationError('Crypto payout requires wallet address');
        }
        break;

      default:
        // Manual or other methods may have flexible requirements
        break;
    }
  }

  /**
   * Encrypt sensitive beneficiary information
   *
   * In production, use proper encryption (AES-256, Vault, etc.)
   * This is a placeholder implementation
   *
   * @private
   * @param {object} beneficiary - Beneficiary details
   * @returns {object} Encrypted beneficiary
   */
  _encryptBeneficiary(beneficiary) {
    // TODO: Implement proper encryption
    // For now, return as-is
    // In production:
    // - Use crypto.createCipheriv() for encryption
    // - Store encryption key in secure vault
    // - Never log or expose encryption keys

    return beneficiary;
  }

  /**
   * Submit payment to provider
   *
   * Integrates with Stripe Connect, PayPal, etc.
   *
   * @private
   * @param {object} payout - Payout record
   * @param {string} stripeConnectId - Optional Stripe Connect ID
   * @returns {Promise<string>} Transaction ID from provider
   */
  async _submitPaymentToProvider(payout, stripeConnectId) {
    const method = payout.method;

    switch (method) {
      case 'stripe':
      case 'bank_transfer':
        return await this._submitViaStripeConnect(payout, stripeConnectId);

      case 'paypal':
        return await this._submitViaPayPal(payout);

      case 'cryptocurrency':
        return await this._submitViaCrypto(payout);

      case 'manual':
        // Manual payouts don't go to provider
        return `manual_${payout._id.toString()}_${Date.now()}`;

      default:
        throw new ServerError(`Unknown payment method: ${method}`);
    }
  }

  /**
   * Submit payout via Stripe Connect
   *
   * @private
   * @param {object} payout - Payout record
   * @param {string} stripeConnectId - Stripe Connect ID
   * @returns {Promise<string>} Payout ID from Stripe
   */
  async _submitViaStripeConnect(payout, stripeConnectId) {
    try {
      // Get Stripe instance
      const { stripe } = require('../config/stripe');

      if (!stripeConnectId) {
        throw new ValidationError('Stripe Connect ID required for Stripe payouts');
      }

      // Create payout via Stripe
      const stripePayout = await stripe.payouts.create(
        {
          amount: Math.round(payout.amount * 100), // Convert to cents
          currency: 'usd',
          destination: stripeConnectId,
          statement_descriptor: 'Spherekings Affiliate Payout',
          metadata: {
            payoutId: payout._id.toString(),
            affiliateId: payout.affiliateId.toString()
          }
        },
        {
          stripeAccount: stripeConnectId
        }
      );

      console.log(`✓ Stripe payout created: ${stripePayout.id}`);
      return stripePayout.id;
    } catch (error) {
      console.error('Stripe payout failed:', error.message);
      throw new ServerError(`Stripe payout failed: ${error.message}`);
    }
  }

  /**
   * Submit payout via PayPal API
   *
   * @private
   * @param {object} payout - Payout record
   * @returns {Promise<string>} Payout batch ID from PayPal
   */
  async _submitViaPayPal(payout) {
    try {
      // TODO: Implement PayPal Payouts API
      // Example structure:
      // const ppClient = require('paypalrestsdk');
      // const payoutBatch = ppClient.PayoutBatch.new({...});
      // payoutBatch.execute();

      // For now, return mock ID
      return `paypal_${payout._id.toString()}_${Date.now()}`;
    } catch (error) {
      console.error('PayPal payout failed:', error.message);
      throw new ServerError(`PayPal payout failed: ${error.message}`);
    }
  }

  /**
   * Submit payout via cryptocurrency
   *
   * @private
   * @param {object} payout - Payout record
   * @returns {Promise<string>} Blockchain transaction hash
   */
  async _submitViaCrypto(payout) {
    try {
      // TODO: Implement blockchain transaction
      // Example structure:
      // const web3 = require('web3');
      // const tx = await web3.eth.sendTransaction({...});

      // For now, return mock hash
      return `crypto_${payout._id.toString()}_${Date.now()}`;
    } catch (error) {
      console.error('Crypto payout failed:', error.message);
      throw new ServerError(`Crypto payout failed: ${error.message}`);
    }
  }
}

module.exports = new PayoutService();
