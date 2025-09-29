import { PendingUser } from '../models/index.js';

/**
 * Cleanup expired pending users
 * This removes pending users whose verification tokens have expired
 */
export const cleanupExpiredPendingUsers = async () => {
  try {
    const result = await PendingUser.deleteMany({
      verificationTokenExpires: { $lt: new Date() }
    });
    
    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} expired pending users`);
    }
    
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return 0;
  }
};

/**
 * Start automatic cleanup job that runs every hour
 */
export const startCleanupJob = () => {
  // Run cleanup immediately on startup
  cleanupExpiredPendingUsers();
  
  // Run cleanup every hour (3600000 ms)
  setInterval(cleanupExpiredPendingUsers, 60 * 60 * 1000);
  
  console.log('🚀 Pending user cleanup job started - runs every hour');
};

/**
 * Manual cleanup function for testing or admin use
 */
export const forceCleanup = async () => {
  console.log('🔧 Running manual cleanup...');
  const deletedCount = await cleanupExpiredPendingUsers();
  console.log(`✅ Manual cleanup completed. Removed ${deletedCount} expired pending users`);
  return deletedCount;
};