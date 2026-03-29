/**
 * Influencer Controller
 * Handles influencer application submissions, approvals, and product assignments
 */

const InfluencerApplication = require('../models/InfluencerApplication');
const Product = require('../models/Product');
const { 
  validateInfluencerApplication, 
  validateInfluencerApproval, 
  validateInfluencerRejection 
} = require('../validators/influencerValidator');

/**
 * Submit influencer application
 * POST /api/influencer/apply
 */
exports.submitApplication = async (req, res, next) => {
  try {
    const { error, value } = validateInfluencerApplication(req.body);
    
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

    // Check if email already exists
    const existingApp = await InfluencerApplication.findOne({ email: value.email });
    if (existingApp) {
      return res.status(409).json({
        success: false,
        message: 'An application with this email already exists',
        errors: { email: 'Email already in use' },
      });
    }

    // Create new application with userId if authenticated
    const applicationData = {
      ...value,
      userId: req.user?.userId || null, // Optional if not authenticated
    };

    const application = new InfluencerApplication(applicationData);
    await application.save();

    // Return sanitized response without sensitive fields
    const response = application.toObject();
    delete response.__v;

    res.status(201).json({
      success: true,
      message: `Application submitted successfully. Status: ${application.status === 'approved' ? 'Auto-approved!' : 'Pending admin review'}`,
      data: response,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current user's influencer application
 * GET /api/influencer/my-application
 */
exports.getMyApplication = async (req, res, next) => {
  try {
    console.log('🔍 Getting application for user:', {
      userId: req.user?.userId,
      role: req.user?.role,
    });

    const application = await InfluencerApplication.findOne({
      userId: req.user?.userId,
    }).populate('productAssigned', 'name description images price');

    if (!application) {
      console.log('❌ No application found for user:', req.user?.userId);
      return res.status(404).json({
        success: false,
        message: 'No application found',
      });
    }

    console.log('✅ Application found for user:', {
      userId: req.user?.userId,
      appEmail: application.email,
      status: application.status,
    });

    res.json({
      success: true,
      data: application,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * List all influencer applications (admin)
 * GET /api/influencer/applications
 * Query params: status, sortBy, limit, page, followerCount
 */
exports.listApplications = async (req, res, next) => {
  try {
    const { status, followerMin, followerMax, page = 1, limit = 20, sortBy = '-createdAt' } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (followerMin) filter.followerCount = { $gte: parseInt(followerMin) };
    if (followerMax) {
      filter.followerCount = { ...filter.followerCount, $lte: parseInt(followerMax) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      InfluencerApplication.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      InfluencerApplication.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: applications,
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
 * Get single influencer application (admin)
 * GET /api/influencer/applications/:id
 */
exports.getApplication = async (req, res, next) => {
  try {
    const application = await InfluencerApplication.findById(req.params.id)
      .populate('productAssigned', 'name description price images');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Approve influencer application (admin)
 * PUT /api/influencer/applications/:id/approve
 */
exports.approveApplication = async (req, res, next) => {
  try {
    const { error, value } = validateInfluencerApproval(req.body);

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

    const application = await InfluencerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve application with status '${application.status}'`,
      });
    }

    application.status = 'approved';
    application.approvedAt = new Date();
    application.approveBy = req.user.userId;
    if (value.approvalNotes) {
      application.approvalNotes = value.approvalNotes;
    }

    await application.save();

    res.json({
      success: true,
      message: 'Application approved successfully',
      data: application,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Reject influencer application (admin)
 * PUT /api/influencer/applications/:id/reject
 */
exports.rejectApplication = async (req, res, next) => {
  try {
    const { error, value } = validateInfluencerRejection(req.body);

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

    const application = await InfluencerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject application with status '${application.status}'`,
      });
    }

    application.status = 'rejected';
    application.approvalNotes = value.rejectionReason;
    await application.save();

    res.json({
      success: true,
      message: 'Application rejected',
      data: application,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Assign product to approved influencer (admin)
 * PUT /api/influencer/applications/:id/assign-product
 */
exports.assignProduct = async (req, res, next) => {
  try {
    const { productId, trackingNumber } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
        errors: { productId: 'Product ID is required' },
      });
    }

    const application = await InfluencerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: `Can only assign product to approved applications (current status: '${application.status}')`,
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        errors: { productId: 'Product does not exist' },
      });
    }

    // Update application
    application.productAssigned = productId;
    application.fulfillmentStatus = 'processing';
    if (trackingNumber) {
      application.trackingNumber = trackingNumber;
      application.fulfillmentStatus = 'shipped';
    }

    await application.save();

    // Populate product details in response
    await application.populate('productAssigned', 'name description price images');

    res.json({
      success: true,
      message: 'Product assigned successfully',
      data: application,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update fulfillment status (admin)
 * PUT /api/influencer/applications/:id/fulfillment
 */
exports.updateFulfillmentStatus = async (req, res, next) => {
  try {
    const { fulfillmentStatus, trackingNumber } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered'];
    if (!fulfillmentStatus || !validStatuses.includes(fulfillmentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fulfillment status',
        errors: { fulfillmentStatus: `Must be one of: ${validStatuses.join(', ')}` },
      });
    }

    const application = await InfluencerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (!application.productAssigned) {
      return res.status(400).json({
        success: false,
        message: 'No product assigned to this application',
      });
    }

    application.fulfillmentStatus = fulfillmentStatus;
    if (trackingNumber) {
      application.trackingNumber = trackingNumber;
    }

    await application.save();

    res.json({
      success: true,
      message: 'Fulfillment status updated',
      data: application,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Add content link (influencer)
 * PUT /api/influencer/applications/:id/add-content
 */
exports.addContentLink = async (req, res, next) => {
  try {
    const { url, platform, title } = req.body;

    if (!url || !platform) {
      return res.status(400).json({
        success: false,
        message: 'URL and platform are required',
      });
    }

    const application = await InfluencerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Verify ownership
    if (application.userId && application.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this application',
      });
    }

    application.contentLinks.push({
      url,
      platform,
      title: title || undefined,
      postedAt: new Date(),
      addedAt: new Date(),
    });

    // Increment videos delivered counter
    application.videosDelivered = application.contentLinks.length;

    await application.save();

    res.json({
      success: true,
      message: 'Content link added',
      data: application,
    });
  } catch (err) {
    next(err);
  }
};

// Approve content submission
exports.approveContent = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { contentApprovalNotes } = req.body;

    const application = await InfluencerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check if application has submitted content
    if (!application.contentLinks || application.contentLinks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No content links to approve',
      });
    }

    // Mark content as approved
    application.contentApproved = true;
    application.contentApprovedAt = new Date();
    application.contentApprovalNotes = contentApprovalNotes || '';

    await application.save();

    res.json({
      success: true,
      message: 'Content approved successfully',
      data: application,
    });
  } catch (err) {
    next(err);
  }
};

// Reject content submission
exports.rejectContent = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { contentRejectReason } = req.body;

    if (!contentRejectReason || contentRejectReason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason must be at least 10 characters',
      });
    }

    const application = await InfluencerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Mark content as rejected
    application.contentRejected = true;
    application.contentRejectedAt = new Date();
    application.contentRejectReason = contentRejectReason;

    await application.save();

    res.json({
      success: true,
      message: 'Content rejected. Influencer will be notified to resubmit.',
      data: application,
    });
  } catch (err) {
    next(err);
  }
};
