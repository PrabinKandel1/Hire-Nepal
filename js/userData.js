// js/userData.js - COMPLETELY FIXED VERSION
// Safe localStorage wrapper with fallback
const safeStorage = {
    getItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('localStorage get failed:', e);
            return null;
        }
    },
    setItem(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.warn('localStorage set failed (may be full):', e);
            if (e.name === 'QuotaExceededError') {
                this.clearOldData();
                try {
                    localStorage.setItem(key, value);
                    return true;
                } catch(e2) {
                    console.error('Still failed after cleanup:', e2);
                    return false;
                }
            }
            return false;
        }
    },
    removeItem(key) {
        try {
            localStorage.removeItem(key);
        } catch(e) {}
    },
    clearOldData() {
        const keysToRemove = ['hirenepal_notifications', 'hirenepal_negotiations', 'recentViews'];
        keysToRemove.forEach(key => {
            try { localStorage.removeItem(key); } catch(e) {}
        });
        console.log('Cleaned old data due to quota exceeded');
    }
};

// ========== USER DATABASE ==========
const USERS_DB_KEY = 'hirenepal_users';
const CURRENT_USER_KEY = 'hirenepal_current_user';

// Initialize users database
function initializeUserDatabase() {
    if (!localStorage.getItem(USERS_DB_KEY)) {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify([]));
    }
}

// Get all users
function getAllUsers() {
    initializeUserDatabase();
    return JSON.parse(localStorage.getItem(USERS_DB_KEY));
}

// Save all users
function saveAllUsers(users) {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

// Get current user ID
function getCurrentUserId() {
    return localStorage.getItem(CURRENT_USER_KEY);
}

// Get current user object
function getCurrentUser() {
    const userId = getCurrentUserId();
    if (!userId) return null;
    
    const users = getAllUsers();
    return users.find(u => u.userId === userId) || null;
}

// Check if user is logged in
function isLoggedIn() {
    return !!getCurrentUserId();
}

// Login user
function loginUser(username, password) {
    const users = getAllUsers();
    const user = users.find(u => u.username === username || u.email === username);
    
    if (!user) {
        return { success: false, message: 'User not found!' };
    }
    
    if (user.password !== password) {
        return { success: false, message: 'Incorrect password!' };
    }
    
    localStorage.setItem(CURRENT_USER_KEY, user.userId);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUserId', user.userId);
    localStorage.setItem('currentUserName', user.username);
    localStorage.setItem('currentUserFullName', user.fullName);
    localStorage.setItem('currentUserEmail', user.email);
    
    return { success: true, user: user };
}

// Logout user
function logoutUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('currentUserFullName');
    localStorage.removeItem('currentUserEmail');
}

// Create new user
function createUser(userData) {
    const users = getAllUsers();
    
    if (users.some(u => u.username === userData.username)) {
        return { success: false, message: 'Username already taken!' };
    }
    if (users.some(u => u.email === userData.email)) {
        return { success: false, message: 'Email already registered!' };
    }
    
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const newUser = {
        userId: userId,
        username: userData.username,
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        joinDate: new Date().toISOString(),
        photo: null
    };
    // In createUser function, add:
joinDate: new Date().toISOString(),
    
    users.push(newUser);
    saveAllUsers(users);
    
    // Create user data storage
    initializeUserData(userId);
    
    // Auto login after signup
    localStorage.setItem(CURRENT_USER_KEY, userId);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUserId', userId);
    localStorage.setItem('currentUserName', userData.username);
    localStorage.setItem('currentUserFullName', userData.fullName);
    localStorage.setItem('currentUserEmail', userData.email);
    
    return { success: true, user: newUser };
}

// Initialize user-specific data
function initializeUserData(userId) {
    const dataKey = `userdata_${userId}`;
    if (!localStorage.getItem(dataKey)) {
        const initialData = {
            myHires: [],
            bookmarks: [],
            jobPosts: [],
            reviews: {},
            wallet: { balance: 0, transactions: [] },
            whatsappClicks: 0,
            badges: { earned: [], progress: {} }
        };
        localStorage.setItem(dataKey, JSON.stringify(initialData));
    }
    return getUserDataById(userId);
}

// Get user data by ID
function getUserDataById(userId) {
    const dataKey = `userdata_${userId}`;
    return JSON.parse(localStorage.getItem(dataKey)) || null;
}

// ========== USER DATA ACCESS ==========
function getUserData() {
    const userId = getCurrentUserId();
    if (!userId) return null;
    
    const dataKey = `userdata_${userId}`;
    let userData = JSON.parse(localStorage.getItem(dataKey));
    
    if (!userData) {
        userData = initializeUserData(userId);
    }
    
    return userData;
}

function saveUserData(userData) {
    const userId = getCurrentUserId();
    if (!userId) return false;
    localStorage.setItem(`userdata_${userId}`, JSON.stringify(userData));
    return true;
}

// My Hires
function getUserHires() {
    const userData = getUserData();
    return (userData && userData.myHires) ? userData.myHires : [];
}

function addUserHire(hire) {
    const userData = getUserData();
    if (!userData) return false;
    
    if (userData.myHires.some(h => h.id === hire.id)) {
        return false;
    }
    
    userData.myHires.push(hire);
    saveUserData(userData);
    console.log('Hire saved:', hire);
    return true;
}

function removeUserHire(hireId) {
    const userData = getUserData();
    if (!userData) return false;
    
    userData.myHires = userData.myHires.filter(h => h.id !== hireId);
    saveUserData(userData);
    return true;
}

// Bookmarks
function getUserBookmarks() {
    const userData = getUserData();
    return (userData && userData.bookmarks) ? userData.bookmarks : [];
}

function toggleUserBookmark(workerId) {
    const userData = getUserData();
    if (!userData) return false;
    
    const index = userData.bookmarks.indexOf(workerId);
    if (index === -1) {
        userData.bookmarks.push(workerId);
        saveUserData(userData);
        return true;
    } else {
        userData.bookmarks.splice(index, 1);
        saveUserData(userData);
        return false;
    }
}

// Job Posts
function getUserJobPosts() {
    const userData = getUserData();
    return (userData && userData.jobPosts) ? userData.jobPosts : [];
}

function addUserJobPost(jobPost) {
    const userData = getUserData();
    if (!userData) return false;
    
    userData.jobPosts.push(jobPost);
    saveUserData(userData);
    return true;
}

// ========== FIXED: REVIEW FUNCTIONS (No recursion) ==========
function getAllUserReviews() {
    const userData = getUserData();
    return (userData && userData.reviews) ? userData.reviews : {};
}

function getUserReviews(workerId = null) {
    const userData = getUserData();
    if (!userData) return workerId ? [] : {};
    
    if (workerId !== null) {
        return (userData.reviews && userData.reviews[workerId]) ? userData.reviews[workerId] : [];
    }
    return userData.reviews || {};
}

function addUserReview(workerId, review) {
    const userData = getUserData();
    if (!userData) return false;
    
    if (!userData.reviews) {
        userData.reviews = {};
    }
    
    if (!userData.reviews[workerId]) {
        userData.reviews[workerId] = [];
    }
    
    const currentUser = getCurrentUser();
    review.userId = currentUser.userId;
    review.userName = currentUser.username;
    review.userFullName = currentUser.fullName;
    
    userData.reviews[workerId].push(review);
    saveUserData(userData);
    return true;
}

function deleteUserReview(workerId, reviewId) {
    const userData = getUserData();
    if (!userData || !userData.reviews || !userData.reviews[workerId]) return false;
    
    userData.reviews[workerId] = userData.reviews[workerId].filter(r => r.id !== reviewId);
    
    if (userData.reviews[workerId].length === 0) {
        delete userData.reviews[workerId];
    }
    
    saveUserData(userData);
    return true;
}

// WhatsApp clicks
function incrementWhatsAppClicks() {
    const userData = getUserData();
    if (!userData) return 0;
    
    userData.whatsappClicks = (userData.whatsappClicks || 0) + 1;
    saveUserData(userData);
    return userData.whatsappClicks;
}

function getWhatsAppClicks() {
    const userData = getUserData();
    return (userData && userData.whatsappClicks) ? userData.whatsappClicks : 0;
}

// Badges
function getUserBadges() {
    const userData = getUserData();
    return (userData && userData.badges) ? userData.badges : { earned: [], progress: {} };
}

function updateUserBadges(badges) {
    const userData = getUserData();
    if (!userData) return false;
    
    userData.badges = badges;
    saveUserData(userData);
    return true;
}

// Wallet
function getUserWallet() {
    const userData = getUserData();
    return (userData && userData.wallet) ? userData.wallet : { balance: 0, transactions: [] };
}

function updateUserWallet(wallet) {
    const userData = getUserData();
    if (!userData) return false;
    
    userData.wallet = wallet;
    saveUserData(userData);
    return true;
}


// Profile update
function updateUserProfile(updates) {
    const userId = getCurrentUserId();
    if (!userId) return { success: false, message: 'Not logged in!' };
    
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.userId === userId);
    
    if (userIndex === -1) {
        return { success: false, message: 'User not found!' };
    }
    
    users[userIndex] = { ...users[userIndex], ...updates };
    saveAllUsers(users);
    
    if (updates.username) localStorage.setItem('currentUserName', updates.username);
    if (updates.fullName) localStorage.setItem('currentUserFullName', updates.fullName);
    if (updates.email) localStorage.setItem('currentUserEmail', updates.email);
    
    return { success: true, message: 'Profile updated!' };
}

function changeUserPassword(currentPassword, newPassword) {
    const userId = getCurrentUserId();
    if (!userId) return { success: false, message: 'Not logged in!' };
    
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.userId === userId);
    
    if (userIndex === -1) {
        return { success: false, message: 'User not found!' };
    }
    
    if (users[userIndex].password !== currentPassword) {
        return { success: false, message: 'Current password is incorrect!' };
    }
    
    users[userIndex].password = newPassword;
    saveAllUsers(users);
    
    return { success: true, message: 'Password changed successfully!' };
}

// Password reset functions
window.sendResetCode = function(email) {
    const users = getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
        return { success: false, message: 'Email not registered!' };
    }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 15 * 60 * 1000;
    
    const resetCodes = JSON.parse(localStorage.getItem('hirenepal_reset_codes') || '{}');
    resetCodes[email] = {
        code: code,
        expiry: expiry,
        used: false
    };
    localStorage.setItem('hirenepal_reset_codes', JSON.stringify(resetCodes));
    
    alert(`🔐 PASSWORD RESET CODE: ${code}\n\n(This is a demo - in real app, this would be sent to ${email})`);
    
    return { success: true, message: 'Reset code sent!' };
};

window.verifyResetCode = function(email, code) {
    const resetCodes = JSON.parse(localStorage.getItem('hirenepal_reset_codes') || '{}');
    const resetData = resetCodes[email];
    
    if (!resetData) {
        return { success: false, message: 'No reset request found!' };
    }
    
    if (resetData.used) {
        return { success: false, message: 'Code already used!' };
    }
    
    if (Date.now() > resetData.expiry) {
        return { success: false, message: 'Code expired! Request new code.' };
    }
    
    if (resetData.code !== code) {
        return { success: false, message: 'Invalid code!' };
    }
    
    return { success: true, message: 'Code verified!' };
};

window.resetPassword = function(email, newPassword) {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
        return { success: false, message: 'User not found!' };
    }
    
    users[userIndex].password = newPassword;
    saveAllUsers(users);
    
    const resetCodes = JSON.parse(localStorage.getItem('hirenepal_reset_codes') || '{}');
    if (resetCodes[email]) {
        resetCodes[email].used = true;
        localStorage.setItem('hirenepal_reset_codes', JSON.stringify(resetCodes));
    }
    
    return { success: true, message: 'Password reset successful!' };
};

// ========== PHOTO REVIEWS SYSTEM ==========
function addReviewWithPhoto(workerId, stars, text, photoBase64 = null) {
    const userData = getUserData();
    if (!userData) return false;
    
    if (!userData.reviews) {
        userData.reviews = {};
    }
    
    if (!userData.reviews[workerId]) {
        userData.reviews[workerId] = [];
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    const review = {
        id: Date.now(),
        stars: stars,
        text: text || 'No comment provided',
        photo: photoBase64,
        userId: currentUser.userId,
        userName: currentUser.username,
        userFullName: currentUser.fullName,
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        }),
        timestamp: new Date().toISOString()
    };
    
    userData.reviews[workerId].push(review);
    saveUserData(userData);
    
    return review;
}

function getWorkerPhotoReviews(workerId) {
    const reviews = getUserReviews(workerId);
    return reviews.filter(r => r.photo);
}

// ========== NEGOTIATION SYSTEM ==========
const NEGOTIATIONS_KEY = 'hirenepal_negotiations';

function getNegotiations(workerId = null) {
    const all = JSON.parse(localStorage.getItem(NEGOTIATIONS_KEY) || '[]');
    if (workerId) {
        return all.filter(n => n.workerId === workerId)
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
    return all.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function saveNegotiations(negotiations) {
    localStorage.setItem(NEGOTIATIONS_KEY, JSON.stringify(negotiations));
}

function createOffer(workerId, amount, message, type = 'hourly') {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    const offer = {
        id: 'neg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        workerId: workerId,
        userId: currentUser.userId,
        userName: currentUser.username,
        userFullName: currentUser.fullName,
        amount: parseInt(amount),
        message: message || '',
        type: type,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [{
            action: 'created',
            amount: parseInt(amount),
            message: message,
            by: 'user',
            timestamp: new Date().toISOString()
        }]
    };
    
    const negotiations = getNegotiations();
    negotiations.push(offer);
    saveNegotiations(negotiations);
    
    return offer;
}

function acceptOffer(negotiationId) {
    const negotiations = getNegotiations();
    const negotiation = negotiations.find(n => n.id === negotiationId);
    if (!negotiation) return null;
    
    negotiation.status = 'accepted';
    negotiation.updatedAt = new Date().toISOString();
    negotiation.history.push({
        action: 'accepted',
        by: getCurrentUserId(),
        timestamp: new Date().toISOString()
    });
    
    saveNegotiations(negotiations);
    return negotiation;
}

function rejectOffer(negotiationId) {
    const negotiations = getNegotiations();
    const negotiation = negotiations.find(n => n.id === negotiationId);
    if (!negotiation) return null;
    
    negotiation.status = 'rejected';
    negotiation.updatedAt = new Date().toISOString();
    negotiation.history.push({
        action: 'rejected',
        by: getCurrentUserId(),
        timestamp: new Date().toISOString()
    });
    
    saveNegotiations(negotiations);
    return negotiation;
}

// Initialize on load
initializeUserDatabase();
// Add this function to userData.js
function getVerificationData(userId = null) {
    const targetId = userId || getCurrentUserId();
    if (!targetId) return null;
    const data = localStorage.getItem(`hirenepal_verification_${targetId}`);
    return data ? JSON.parse(data) : { status: 'unverified', verificationCode: null };
}

function saveVerificationData(data, userId = null) {
    const targetId = userId || getCurrentUserId();
    if (!targetId) return;
    localStorage.setItem(`hirenepal_verification_${targetId}`, JSON.stringify(data));
}
// Add these functions to your existing userData.js file

// Get all pending jobs (for admin)
function getAllPendingJobs() {
    return JSON.parse(localStorage.getItem('hirenepal_pending_jobs') || '[]');
}

// Get all approved jobs
function getAllApprovedJobs() {
    return JSON.parse(localStorage.getItem('hirenepal_approved_jobs') || '[]');
}

// Approve a job
function approveJob(jobId) {
    let pending = getAllPendingJobs();
    let approved = getAllApprovedJobs();
    const jobIndex = pending.findIndex(j => j.id === jobId);
    
    if (jobIndex === -1) return false;
    
    const job = pending[jobIndex];
    job.status = 'approved';
    job.reviewedAt = new Date().toISOString();
    
    pending.splice(jobIndex, 1);
    approved.push(job);
    
    localStorage.setItem('hirenepal_pending_jobs', JSON.stringify(pending));
    localStorage.setItem('hirenepal_approved_jobs', JSON.stringify(approved));
    return true;
}

// Reject a job
function rejectJob(jobId) {
    let pending = getAllPendingJobs();
    const jobIndex = pending.findIndex(j => j.id === jobId);
    
    if (jobIndex === -1) return false;
    
    pending.splice(jobIndex, 1);
    localStorage.setItem('hirenepal_pending_jobs', JSON.stringify(pending));
    return true;
}

// Get all workers (default + custom)
function getAllWorkersList() {
    const defaultWorkers = typeof workers !== 'undefined' ? workers : [];
    const customWorkers = JSON.parse(localStorage.getItem('hirenepal_workers') || '[]');
    
    // Merge without duplicates (by id)
    const allWorkers = [...defaultWorkers];
    customWorkers.forEach(cw => {
        if (!allWorkers.some(w => w.id === cw.id)) {
            allWorkers.push(cw);
        }
    });
    return allWorkers;
}

// Update global workers array on every page
window.workers = getAllWorkersList();

// Helper to refresh workers after admin actions
function refreshWorkersList() {
    window.workers = getAllWorkersList();
    // Dispatch custom event for pages to react
    window.dispatchEvent(new CustomEvent('workersUpdated'));
}

// Add a new worker
function addWorkerToDB(workerData) {
    let workers = JSON.parse(localStorage.getItem('hirenepal_workers') || '[]');
    const newId = workers.length > 0 ? Math.max(...workers.map(w => w.id), 50) + 1 : 51;
    
    const newWorker = {
        id: newId,
        ...workerData,
        reviews: []
    };
    
    workers.push(newWorker);
    localStorage.setItem('hirenepal_workers', JSON.stringify(workers));
    return newWorker;
}

// Delete a worker
function deleteWorkerFromDB(workerId) {
    let workers = JSON.parse(localStorage.getItem('hirenepal_workers') || '[]');
    workers = workers.filter(w => w.id !== workerId);
    localStorage.setItem('hirenepal_workers', JSON.stringify(workers));
    return true;
}
// Add these functions to your existing userData.js file

// Get all pending jobs (for admin)
function getAllPendingJobs() {
    return JSON.parse(localStorage.getItem('hirenepal_pending_jobs') || '[]');
}

// Get all approved jobs
function getAllApprovedJobs() {
    return JSON.parse(localStorage.getItem('hirenepal_approved_jobs') || '[]');
}

// Get all workers (including custom added)
function getAllWorkersList() {
    const defaultWorkers = typeof workers !== 'undefined' ? workers : [];
    const customWorkers = JSON.parse(localStorage.getItem('hirenepal_workers') || '[]');
    const allWorkers = [...defaultWorkers];
    customWorkers.forEach(cw => {
        const exists = allWorkers.some(w => w.id === cw.id);
        if (!exists) allWorkers.push(cw);
    });
    return allWorkers;
}
// ========== UNIFIED WORKER SYSTEM ==========
function getAllWorkers() {
    const defaultWorkers = (typeof workers !== 'undefined') ? workers : [];
    const customWorkers = JSON.parse(localStorage.getItem('hirenepal_workers') || '[]');
    const all = [...defaultWorkers];
    customWorkers.forEach(cw => {
        if (!all.some(w => w.id === cw.id)) all.push(cw);
    });
    return all;
}

// Update global workers variable and notify all pages
function refreshGlobalWorkers() {
    if (typeof window.workers !== 'undefined') window.workers = getAllWorkers();
    window.dispatchEvent(new CustomEvent('workersUpdated'));
}

// Override the default workers array if it exists
if (typeof workers !== 'undefined') {
    window.workers = getAllWorkers();
    // Also replace the original array reference
    Object.defineProperty(window, 'workers', {
        get: () => getAllWorkers(),
        set: () => {}
    });
}