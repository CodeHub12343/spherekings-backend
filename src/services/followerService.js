/**
 * Follower Service
 * Business logic for managing followers
 */

const Follower = require('../models/Follower');

class FollowerService {
  /**
   * Subscribe a new follower
   * @param {string} email - Email address
   * @param {object} options - Additional data (source, ipAddress, userAgent)
   * @returns {Promise<{success, message, totalFollowers, wasNewSubscriber}>}
   */
  async subscribeFollower(email, options = {}) {
    try {
      // Check if email already exists
      const existingFollower = await Follower.findOne({ email: email.toLowerCase() });

      if (existingFollower) {
        // Email already subscribed
        if (existingFollower.status === 'subscribed') {
          console.log(`✅ Email already subscribed: ${email}`);
          return {
            success: true,
            message: 'You are already a follower!',
            totalFollowers: await this.getFollowerCount(),
            wasNewSubscriber: false,
            isDuplicate: true,
          };
        } else {
          // Was unsubscribed - reactivate
          existingFollower.status = 'subscribed';
          existingFollower.subscribedAt = new Date();
          existingFollower.unsubscribedAt = null;
          await existingFollower.save();
          console.log(`♻️ Reactivated follower: ${email}`);
          return {
            success: true,
            message: 'Welcome back to the kingdom!',
            totalFollowers: await this.getFollowerCount(),
            wasNewSubscriber: false,
          };
        }
      }

      // Create new follower
      const newFollower = new Follower({
        email: email.toLowerCase(),
        source: options.source || 'landing_page',
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        userId: options.userId || null,
      });

      await newFollower.save();

      const totalFollowers = await this.getFollowerCount();

      console.log(`🎉 New follower subscribed: ${email} | Total: ${totalFollowers}`);

      return {
        success: true,
        message: 'Welcome to the kingdom!',
        totalFollowers,
        wasNewSubscriber: true,
        followerId: newFollower._id,
      };
    } catch (error) {
      console.error('❌ Error subscribing follower:', error.message);
      throw error;
    }
  }

  /**
   * Get total follower count (subscribed only)
   * @returns {Promise<number>} Total count of active followers
   */
  async getFollowerCount() {
    try {
      const count = await Follower.countDocuments({
        status: 'subscribed',
      });
      return count;
    } catch (error) {
      console.error('❌ Error getting follower count:', error.message);
      throw error;
    }
  }

  /**
   * Unsubscribe a follower
   * @param {string} email - Email address
   * @returns {Promise<{success, message, totalFollowers}>}
   */
  async unsubscribeFollower(email) {
    try {
      const follower = await Follower.findOne({ email: email.toLowerCase() });

      if (!follower) {
        return {
          success: false,
          message: 'Email not found',
        };
      }

      follower.status = 'unsubscribed';
      follower.unsubscribedAt = new Date();
      await follower.save();

      console.log(`👋 Follower unsubscribed: ${email}`);

      return {
        success: true,
        message: 'You have been unsubscribed',
        totalFollowers: await this.getFollowerCount(),
      };
    } catch (error) {
      console.error('❌ Error unsubscribing follower:', error.message);
      throw error;
    }
  }

  /**
   * Get follower statistics (admin use)
   * @returns {Promise<{totalFollowers, todayFollowers, weekFollowers, conversionRate}>}
   */
  async getFollowerStats() {
    try {
      const totalFollowers = await Follower.countDocuments({
        status: 'subscribed',
      });

      // Today's followers
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayFollowers = await Follower.countDocuments({
        status: 'subscribed',
        subscribedAt: { $gte: today },
      });

      // This week's followers
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      const weekFollowers = await Follower.countDocuments({
        status: 'subscribed',
        subscribedAt: { $gte: weekAgo },
      });

      // Conversion rate (became customer)
      const convertedFollowers = await Follower.countDocuments({
        status: 'subscribed',
        becameCustomer: true,
      });
      const conversionRate = totalFollowers > 0 
        ? Math.round((convertedFollowers / totalFollowers) * 100)
        : 0;

      console.log(`📊 Follower Stats: Total=${totalFollowers}, Today=${todayFollowers}, Week=${weekFollowers}`);

      return {
        totalFollowers,
        todayFollowers,
        weekFollowers,
        convertedFollowers,
        conversionRate,
        unsubscribedCount: await Follower.countDocuments({ status: 'unsubscribed' }),
      };
    } catch (error) {
      console.error('❌ Error getting follower stats:', error.message);
      throw error;
    }
  }

  /**
   * Get recent followers (admin dashboard)
   * @param {number} limit - How many to return
   * @returns {Promise<array>} Array of recent followers
   */
  async getRecentFollowers(limit = 10) {
    try {
      const recent = await Follower.find({ status: 'subscribed' })
        .sort({ subscribedAt: -1 })
        .limit(limit)
        .select('email subscribedAt userId -_id');

      return recent;
    } catch (error) {
      console.error('❌ Error getting recent followers:', error.message);
      throw error;
    }
  }

  /**
   * Check if email is already a follower
   * @param {string} email - Email address
   * @returns {Promise<boolean>}
   */
  async isFollower(email) {
    try {
      const follower = await Follower.findOne({
        email: email.toLowerCase(),
        status: 'subscribed',
      });
      return !!follower;
    } catch (error) {
      console.error('❌ Error checking if follower:', error.message);
      return false;
    }
  }
}

module.exports = new FollowerService();
