/**
 * Sponsorship Controller
 * Handles sponsorship tier management, purchases, webhook processing, and tracking
 */

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SponsorshipTier = require('../models/SponsorshipTier');
const SponsorshipRecord = require('../models/SponsorshipRecord');
const {
  validateSponsorshipPurchase,
  validateSponsorshipUpdate,
  validateSponsorshipStatusUpdate,
  validateSponsorshipTier,
} = require('../validators/sponsorshipValidator');

/**
 * Get all sponsorship tiers (public)
 * GET /api/sponsorship/tiers
 */
exports.getTiers = async (req, res, next) => {
  try {
    const { featured, campaignCycle } = req.query;

    const filter = { active: true };
    if (featured === 'true') filter.featured = true;
    if (campaignCycle) filter.campaignCycle = campaignCycle;

    const tiers = await SponsorshipTier.find(filter)
      .sort('displayOrder')
      .select('-__v -createdBy');

    res.json({
      success: true,
      data: tiers,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single sponsorship tier (public)
 * GET /api/sponsorship/tiers/:id
 */
exports.getTier = async (req, res, next) => {
  try {
    const tier = await SponsorshipTier.findById(req.params.id)
      .select('-__v -createdBy');

    if (!tier) {
      return res.status(404).json({
        success: false,
        message: 'Sponsorship tier not found',
      });
    }

    res.json({
      success: true,
      data: tier,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Initiate sponsorship purchase (create Stripe checkout session)
 * POST /api/sponsorship/purchase
 */
exports.initiatePurchase = async (req, res, next) => {
  try {
    const { error, value } = validateSponsorshipPurchase(req.body);

    if (error) {
      const errors = error.details.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Verify tier exists and get its details
    const tier = await SponsorshipTier.findById(value.tierId);
    if (!tier) {
      return res.status(404).json({
        success: false,
        message: 'Sponsorship tier not found',
      });
    }

    if (!tier.active) {
      return res.status(400).json({
        success: false,
        message: 'This sponsorship tier is no longer available',
      });
    }

    // Check capacity if maxSponsors is set
    if (tier.maxSponsors && tier.sponsorCount >= tier.maxSponsors) {
      return res.status(400).json({
        success: false,
        message: 'This sponsorship tier has reached maximum capacity',
      });
    }

    // Create pending sponsorship record (payment not yet confirmed)
    const sponsorshipRecord = new SponsorshipRecord({
      tierId: tier._id,
      tierName: tier.name,
      tierSlug: tier.slug,
      sponsorName: value.sponsorName,
      sponsorEmail: value.sponsorEmail.toLowerCase(), // Normalize to lowercase
      sponsorCompany: value.sponsorCompany || undefined,
      sponsorUserId: req.user?.id || null,
      amount: tier.price,
      videoMentions: tier.videoMentions,
      videosRemaining: tier.videoMentions,
      videosCompleted: 0,
      status: 'pending_payment',
      paymentStatus: 'pending',
    });

    await sponsorshipRecord.save();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tier.name,
              description: `${tier.videoMentions} video mentions - ${tier.benefitsSummary}`,
              images: [], // Can add tier image if available
            },
            unit_amount: tier.price, // Already in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/sponsorship/success?session_id={CHECKOUT_SESSION_ID}&record_id=${sponsorshipRecord._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/sponsorship/tiers`,
      customer_email: value.sponsorEmail,
      metadata: {
        sponsorshipRecordId: sponsorshipRecord._id.toString(),
        tierId: tier._id.toString(),
        tierName: tier.name,
      },
    });

    // Update sponsorship record with Stripe session ID
    sponsorshipRecord.stripeSessionId = session.id;
    await sponsorshipRecord.save();

    res.json({
      success: true,
      message: 'Checkout session created',
      data: {
        sessionId: session.id,
        recordId: sponsorshipRecord._id,
        checkoutUrl: session.url,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user's sponsorships
 * GET /api/sponsorship/my-sponsorships
 */
exports.getMySponsorships = async (req, res, next) => {
  try {
    // Build filter based on authenticated user
    const filter = {
      $or: [
        // If user has an ID, match by sponsorUserId
        ...(req.user?.id ? [{ sponsorUserId: req.user.id }] : []),
        // Always match by email (more reliable across sessions)
        ...(req.user?.email ? [{ sponsorEmail: req.user.email.toLowerCase() }] : []),
      ],
    };

    console.log(`📋 Fetching sponsorships for user:`, {
      userId: req.user?.id,
      email: req.user?.email,
      filterCount: filter.$or.length,
    });

    // If no filter conditions, return empty array
    if (filter.$or.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const sponsorships = await SponsorshipRecord.find(filter)
      .populate('tierId', 'name slug benefits')
      .sort('-createdAt');

    console.log(`✅ Found ${sponsorships.length} sponsorships for user`);

    res.json({
      success: true,
      data: sponsorships,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * List all sponsorship records (admin)
 * GET /api/sponsorship/records
 * Query params: status, paymentStatus, page, limit, sortBy
 */
exports.listRecords = async (req, res, next) => {
  try {
    const {
      status,
      paymentStatus,
      tierName,
      page = 1,
      limit = 20,
      sortBy = '-createdAt',
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (tierName) filter.tierName = new RegExp(tierName, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [records, total] = await Promise.all([
      SponsorshipRecord.find(filter)
        .populate('tierId', 'name slug videoMentions')
        .sort(sortBy)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      SponsorshipRecord.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single sponsorship record (admin/owner)
 * GET /api/sponsorship/records/:id
 */
exports.getRecord = async (req, res, next) => {
  try {
    const record = await SponsorshipRecord.findById(req.params.id)
      .populate('tierId', 'name slug benefits videoMentions')
      .populate('assignedTo', 'name email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Sponsorship record not found',
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && record.sponsorEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this record',
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update sponsorship progress (add video link)
 * PUT /api/sponsorship/records/:id/add-video
 */
exports.addVideoLink = async (req, res, next) => {
  try {
    const { error, value } = validateSponsorshipUpdate(req.body);

    if (error) {
      const errors = error.details.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});
      console.error(`❌ Validation error for add-video:`, JSON.stringify(errors, null, 2));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const record = await SponsorshipRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Sponsorship record not found',
      });
    }

    if (record.status === 'completed' || record.status === 'failed') {
      return res.status(400).json({
        success: false,
        message: `Cannot add videos to completed or failed sponsorships`,
      });
    }

    const videoData = {
      url: value.url || value.videoUrl,
      platform: value.platform,
      title: value.title,
      postedAt: value.postedAt,
      views: value.views || 0,
      likes: value.likes || 0,
      comments: value.comments || 0,
      shares: value.shares || 0,
      verifiedAt: new Date(),
    };

    // Call model method to add video
    await record.addVideoLink(videoData);

    // Increment videosCompleted
    record.videosCompleted += 1;
    
    // Update status if all videos completed
    if (record.videosCompleted >= record.videoMentions) {
      record.status = 'completed';
      console.log(`✅ All videos completed for sponsorship ${record._id}`);
    } else {
      record.status = 'in_progress';
    }

    if (value.adminNotes) {
      record.adminNotes = value.adminNotes;
    }

    await record.save();

    console.log(`📹 Video added: ${record.videosCompleted}/${record.videoMentions} for sponsorship ${record._id}`);

    res.json({
      success: true,
      message: 'Video link added successfully',
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update sponsorship status (admin)
 * PUT /api/sponsorship/records/:id/status
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { error, value } = validateSponsorshipStatusUpdate(req.body);

    if (error) {
      const errors = error.details.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const record = await SponsorshipRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Sponsorship record not found',
      });
    }

    record.status = value.status;
    if (value.failureReason) {
      record.failureReason = value.failureReason;
    }
    if (value.adminNotes) {
      record.adminNotes = value.adminNotes;
    }

    await record.save();

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle Stripe Webhook (payment completion)
 * POST /api/sponsorship/webhook
 */
exports.handlePaymentWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  try {
    // Verify signature
    // req.body is a Buffer from express.raw() middleware
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_SPONSORSHIP_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Find sponsorship record by stripe session ID
      const record = await SponsorshipRecord.findOne({
        stripeSessionId: session.id,
      });

      if (!record) {
        console.warn(`No sponsorship record found for session ${session.id}`);
        return res.json({ received: true }); // Still acknowledge the event
      }

      // Update payment details
      record.paymentStatus = 'completed';
      record.paidAt = new Date(); // Payment completed now
      record.status = 'active';

      // Extract Stripe payment intent ID
      if (session.payment_intent) {
        record.stripePaymentIntentId = session.payment_intent;
      }

      // Increment tier sponsor count
      const tier = await SponsorshipTier.findById(record.tierId);
      if (tier) {
        tier.sponsorCount = (tier.sponsorCount || 0) + 1;
        await tier.save();

        // Set promotion dates based on tier's delivery days
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (tier.defaultDeliveryDays || 45));
        
        record.promotionStartDate = startDate;
        record.promotionEndDate = endDate;
        
        console.log(`📅 Promotion period: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]} (${tier.defaultDeliveryDays} days)`);
      }

      await record.save();

      console.log(`Sponsorship record ${record._id} marked as paid`);
    }

    // Acknowledge receipt of event
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook Error:', err.message);
    // Return 400 on webhook signature failure
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

/**
 * Create sponsorship tier (admin)
 * POST /api/sponsorship/tiers
 */
exports.createTier = async (req, res, next) => {
  try {
    const { error, value } = validateSponsorshipTier(req.body);

    if (error) {
      const errors = error.details.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Check for duplicate slug
    const existingTier = await SponsorshipTier.findOne({ slug: value.slug });
    if (existingTier) {
      return res.status(409).json({
        success: false,
        message: 'A tier with this slug already exists',
        errors: { slug: 'Slug must be unique' },
      });
    }

    const tier = new SponsorshipTier({
      ...value,
      createdBy: req.user.id,
    });

    await tier.save();

    res.status(201).json({
      success: true,
      message: 'Sponsorship tier created',
      data: tier,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update sponsorship tier (admin)
 * PUT /api/sponsorship/tiers/:id
 */
exports.updateTier = async (req, res, next) => {
  try {
    const { error, value } = validateSponsorshipTier(req.body);

    if (error) {
      const errors = error.details.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const tier = await SponsorshipTier.findById(req.params.id);

    if (!tier) {
      return res.status(404).json({
        success: false,
        message: 'Sponsorship tier not found',
      });
    }

    // Check for duplicate slug if changing
    if (value.slug !== tier.slug) {
      const existing = await SponsorshipTier.findOne({
        slug: value.slug,
        _id: { $ne: tier._id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A tier with this slug already exists',
        });
      }
    }

    Object.assign(tier, value);
    await tier.save();

    res.json({
      success: true,
      message: 'Sponsorship tier updated',
      data: tier,
    });
  } catch (err) {
    next(err);
  }
};
