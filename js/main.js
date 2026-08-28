// js/main.js - COMPLETELY FIXED VERSION (NO DUPLICATES)

// ===================== MOBILE MENU TOGGLE (COMPLETELY FIXED) =====================
(function() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (menuToggle && navLinks) {
        // Create overlay if it doesn't exist
        let overlay = document.querySelector('.nav-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'nav-overlay';
            document.body.appendChild(overlay);
        }
        
        function closeMenu() {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        function openMenu() {
            menuToggle.classList.add('active');
            navLinks.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        // Toggle menu on button click
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (navLinks.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        // Close menu when clicking overlay
        overlay.addEventListener('click', closeMenu);
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMenu();
            }
        });
        
        console.log('✅ Mobile menu initialized');
    } else {
        console.log('Menu toggle or nav links not found');
    }
    
    // Scroll effect for header
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
})();

// ===================== DARK MODE TOGGLE =====================
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = '☀️';
        }
    });
}

// ===================== NAVIGATION BASED ON LOGIN STATE =====================
function updateNavigation() {
    // Check ALL possible login indicators
    const method1 = localStorage.getItem('isLoggedIn') === 'true';
    const method2 = !!localStorage.getItem('hirenepal_current_user');
    const method3 = !!localStorage.getItem('currentUserId');
    const method4 = !!localStorage.getItem('currentUserName');
    
    const isLoggedIn = method1 || method2 || method3 || method4;
    const userName = localStorage.getItem('currentUserName') || localStorage.getItem('currentUserFullName') || 'User';

    console.log('Navigation - Login status:', isLoggedIn ? '✅ LOGGED IN' : '❌ NOT LOGGED IN');

    const authLink = document.getElementById('authLink');
    if (authLink) {
        if (isLoggedIn) {
            authLink.textContent = `Logout (${userName})`;
            authLink.href = '#';
            authLink.onclick = (e) => {
                e.preventDefault();
                if (confirm('Log out?')) {
                    // Clear all user data from localStorage
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('currentUserId');
                    localStorage.removeItem('currentUserName');
                    localStorage.removeItem('currentUserFullName');
                    localStorage.removeItem('currentUserEmail');
                    localStorage.removeItem('userPhoto');
                    localStorage.removeItem('hirenepal_current_user');
                    window.location.href = 'index.html';
                }
            };
        } else {
            authLink.textContent = 'Login / Sign Up';
            authLink.href = 'login.html';
            authLink.onclick = null;
        }
    }

    const myHiresLink = document.getElementById('myHiresLink');
    if (myHiresLink) {
        myHiresLink.style.display = isLoggedIn ? 'inline-block' : 'none';
    }
}

// Run on every page load
document.addEventListener('DOMContentLoaded', updateNavigation);

// Also run when localStorage changes (login/logout in another tab)
window.addEventListener('storage', function(e) {
    if (e.key === 'isLoggedIn' || e.key === 'hirenepal_current_user' || e.key === 'currentUserId') {
        updateNavigation();
    }
});

// ===================== ACTIVE PAGE HIGHLIGHTING =====================
function highlightCurrentPage() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('#navLinks a, .nav-link');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', highlightCurrentPage);

// ===================== TOAST NOTIFICATION =====================
function showToast(message, bgColor = '#10b981', duration = 2800) {
    let toast = document.getElementById('global-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'global-toast';
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 14px 24px;
            border-radius: 12px; color: white; font-weight: 500; z-index: 9999;
            box-shadow: 0 6px 20px rgba(0,0,0,0.35); display: none; min-width: 220px;
            text-align: center;
        `;
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.background = bgColor;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, duration);
}

window.showToast = showToast;

// ===================== SCROLL TO TOP BUTTON =====================
(function() {
    let scrollBtn = document.getElementById('scrollTopBtn');
    
    if (!scrollBtn) {
        scrollBtn = document.createElement('button');
        scrollBtn.id = 'scrollTopBtn';
        scrollBtn.innerHTML = '↑';
        scrollBtn.title = 'Go to top';
        document.body.appendChild(scrollBtn);
    }

    const scrollThreshold = 300;

    function checkScroll() {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        
        if (scrollY > scrollThreshold) {
            scrollBtn.classList.add('visible');
            scrollBtn.classList.add('pulse');
        } else {
            scrollBtn.classList.remove('visible');
            scrollBtn.classList.remove('pulse');
        }
    }

    function scrollToTop(e) {
        e.preventDefault();
        
        scrollBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            scrollBtn.style.transform = '';
        }, 200);
        
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        if (typeof window.showToast === 'function') {
            window.showToast('⬆️ Scrolled to top!', 'var(--primary)');
        }
    }

    window.addEventListener('scroll', checkScroll);
    scrollBtn.addEventListener('click', scrollToTop);
    checkScroll();
    window.addEventListener('load', checkScroll);
    
    console.log('✅ Scroll to top button initialized');
})();

// ===================== FLOATING ACTION BUTTON =====================
function toggleFabMenu() {
    const container = document.getElementById('fabContainer');
    if (container) {
        container.classList.toggle('open');
    }
}

// Close FAB when clicking outside
document.addEventListener('click', function(e) {
    const container = document.getElementById('fabContainer');
    if (container && !container.contains(e.target) && container.classList.contains('open')) {
        container.classList.remove('open');
    }
});

// Hide FAB when scrolling to top
window.addEventListener('scroll', function() {
    const fab = document.getElementById('fabContainer');
    if (fab && window.scrollY < 100) {
        fab.style.opacity = '0.5';
    } else if (fab) {
        fab.style.opacity = '1';
    }
});

// ===================== NOTIFICATION SYSTEM =====================
class NotificationSystem {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem('hirenepal_notifications') || '[]');
        this.init();
    }
    
    init() {
        this.createNotificationBell();
        this.updateBadge();
    }
    
    createNotificationBell() {
        const navLinks = document.getElementById('navLinks');
        if (!navLinks) return;
        
        if (document.querySelector('.notification-wrapper')) return;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'notification-wrapper';
        wrapper.innerHTML = `
            <i class="fas fa-bell" style="font-size: 1.4rem;"></i>
            <span class="notification-badge" id="notificationBadge">0</span>
        `;
        
        wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePanel();
        });
        
        const themeToggle = navLinks.querySelector('#themeToggle');
        if (themeToggle) {
            navLinks.insertBefore(wrapper, themeToggle);
        } else {
            navLinks.appendChild(wrapper);
        }
    }
    
    togglePanel() {
        let panel = document.getElementById('notificationsPanel');
        
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'notificationsPanel';
            panel.className = 'notifications-panel';
            document.body.appendChild(panel);
            
            document.addEventListener('click', (e) => {
                if (panel.classList.contains('active') && 
                    !panel.contains(e.target) && 
                    !e.target.closest('.notification-wrapper')) {
                    panel.classList.remove('active');
                }
            });
        }
        
        if (panel.classList.contains('active')) {
            panel.classList.remove('active');
        } else {
            this.renderPanel();
            panel.classList.add('active');
        }
    }
    
    renderPanel() {
        const panel = document.getElementById('notificationsPanel');
        if (!panel) return;
        
        if (this.notifications.length === 0) {
            panel.innerHTML = `
                <div class="notifications-header">
                    <h3><i class="fas fa-bell"></i> Notifications</h3>
                </div>
                <div class="notification-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications yet</p>
                </div>
            `;
            return;
        }
        
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        panel.innerHTML = `
            <div class="notifications-header">
                <h3><i class="fas fa-bell"></i> Notifications</h3>
                ${unreadCount > 0 ? 
                    `<button onclick="window.notifications.markAllAsRead()">Mark all read</button>` : 
                    `<span>${this.notifications.length} total</span>`
                }
            </div>
            <div class="notifications-list" id="notificationsList">
                ${this.notifications.slice(0, 20).map(n => this.renderNotification(n)).join('')}
            </div>
        `;
    }
    
    renderNotification(n) {
        const icons = {
            message: 'fa-envelope',
            hire: 'fa-briefcase',
            review: 'fa-star',
            payment: 'fa-credit-card',
            system: 'fa-bell'
        };
        
        const timeAgo = this.timeAgo(n.timestamp);
        
        return `
            <div class="notification-item ${n.read ? '' : 'unread'}" 
                 onclick="window.notifications.clickNotification('${n.id}', '${n.link || '#'}')">
                <div class="notification-icon ${n.type}">
                    <i class="fas ${icons[n.type] || 'fa-bell'}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${n.title}</div>
                    <div class="notification-message">${n.message}</div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
                ${!n.read ? '<span class="unread-dot"></span>' : ''}
            </div>
        `;
    }
    
    add(type, title, message, link = '#') {
        const notification = {
            id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            type: type,
            title: title,
            message: message,
            link: link,
            read: false,
            timestamp: new Date().toISOString()
        };
        
        this.notifications.unshift(notification);
        
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }
        
        this.save();
        this.updateBadge();
        
        const toastBg = {
            message: '#3b82f6',
            hire: '#10b981',
            review: '#f59e0b',
            payment: '#8b5cf6',
            system: '#6366f1'
        };
        
        if (typeof showToast === 'function') {
            const icon = {
                message: '💬',
                hire: '🤝',
                review: '⭐',
                payment: '💰',
                system: '🔔'
            };
            showToast(`${icon[type] || '🔔'} ${title}`, toastBg[type] || '#6366f1');
        }
        
        const panel = document.getElementById('notificationsPanel');
        if (panel && panel.classList.contains('active')) {
            this.renderPanel();
        }
    }
    
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.save();
            this.updateBadge();
            
            const panel = document.getElementById('notificationsPanel');
            if (panel && panel.classList.contains('active')) {
                this.renderPanel();
            }
        }
    }
    
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.save();
        this.updateBadge();
        
        const panel = document.getElementById('notificationsPanel');
        if (panel && panel.classList.contains('active')) {
            this.renderPanel();
        }
    }
    
    clickNotification(id, link) {
        this.markAsRead(id);
        if (link && link !== '#') {
            window.location.href = link;
        } else {
            document.getElementById('notificationsPanel')?.classList.remove('active');
        }
    }
    
    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        if (!badge) return;
        
        const unreadCount = this.notifications.filter(n => !n.read).length;
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) HireNepal`;
        } else {
            document.title = 'HireNepal';
        }
    }
    
    timeAgo(timestamp) {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        
        if (seconds < 30) return 'just now';
        if (seconds < 60) return `${seconds} seconds ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    }
    
    save() {
        localStorage.setItem('hirenepal_notifications', JSON.stringify(this.notifications));
    }
}

// Initialize notifications for logged in users
document.addEventListener('DOMContentLoaded', function() {
    if (typeof isLoggedIn === 'function' && isLoggedIn()) {
        window.notifications = new NotificationSystem();
    }
});

// Helper functions for notifications
function notifyHire(workerName) {
    if (window.notifications) {
        window.notifications.add('hire', 'New Hire!', `You hired ${workerName}`, 'myhires.html');
    }
}

function notifyMessage(workerName) {
    if (window.notifications) {
        window.notifications.add('message', 'New Message', `Message from ${workerName}`, 'myhires.html');
    }
}

function notifyReview(workerName, stars) {
    if (window.notifications) {
        window.notifications.add('review', 'New Review', `${stars}⭐ review for ${workerName}`, 'your-profile.html');
    }
}

function notifyPayment(amount, workerName) {
    if (window.notifications) {
        window.notifications.add('payment', 'Payment Sent', `Rs. ${amount} to ${workerName}`, 'myhires.html');
    }
}

// ===================== IMAGE LOADING FIX =====================
function fixImageLoading() {
    const defaultImages = {
        worker: 'https://via.placeholder.com/200x200?text=HireNepal+Worker',
        profile: 'https://via.placeholder.com/240x240?text=User',
        generic: 'https://via.placeholder.com/150x150?text=HireNepal'
    };
    
    function setImageFallback(img, type = 'generic') {
        if (!img) return;
        
        const originalSrc = img.src;
        img.onerror = function() {
            if (img.getAttribute('data-fallback-attempted') === 'true') return;
            img.setAttribute('data-fallback-attempted', 'true');
            
            if (type === 'worker' || (originalSrc.includes('unsplash') && originalSrc.includes('auto=format'))) {
                img.src = defaultImages.worker;
            } else if (type === 'profile' || originalSrc.includes('placeholder')) {
                img.src = defaultImages.profile;
            } else {
                img.src = defaultImages.generic;
            }
            
            console.log(`Image fallback used for: ${originalSrc}`);
        };
    }
    
    function fixAllImages() {
        document.querySelectorAll('.worker-img, .card img, .bookmark-card img, .recent-item img, .timeline-item img').forEach(img => {
            setImageFallback(img, 'worker');
        });
        
        document.querySelectorAll('#profilePhoto, .developer-image, .profile-card img').forEach(img => {
            setImageFallback(img, 'profile');
        });
        
        document.querySelectorAll('img:not([data-fallback-processed])').forEach(img => {
            if (!img.hasAttribute('data-fallback-processed')) {
                img.setAttribute('data-fallback-processed', 'true');
                setImageFallback(img, 'generic');
            }
        });
    }
    
    fixAllImages();
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) {
                    if (node.tagName === 'IMG') {
                        setImageFallback(node, 'generic');
                    }
                    node.querySelectorAll('img').forEach(img => {
                        setImageFallback(img, 'generic');
                    });
                }
            });
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', fixImageLoading);

// ===================== SWIPE GESTURES (Mobile Navigation) =====================
(function() {
    let touchstartX = 0;
    
    document.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', e => {
        const touchendX = e.changedTouches[0].screenX;
        const swipeThreshold = 100;
        
        if (document.querySelector('input:focus, textarea:focus, select:focus')) {
            return;
        }
        
        if (touchendX - touchstartX > swipeThreshold) {
            if (navigator.vibrate) navigator.vibrate(20);
            if (typeof showToast === 'function') {
                showToast('⬅️ Going back...', '#6366f1', 1500);
            }
            setTimeout(() => history.back(), 200);
        }
    });
})();

// ===================== CONFETTI EFFECT =====================
function showConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10000';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#fbbf24'];
    
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            rotation: Math.random() * 360,
            spin: Math.random() * 10 - 5
        });
    }
    
    let animationId;
    let startTime = Date.now();
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let allFinished = true;
        for (let p of particles) {
            if (p.y < canvas.height + 50) {
                allFinished = false;
                p.y += p.speed;
                p.rotation += p.spin;
                
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                ctx.restore();
            }
        }
        
        if (allFinished || Date.now() - startTime > 3000) {
            cancelAnimationFrame(animationId);
            canvas.remove();
        } else {
            animationId = requestAnimationFrame(animate);
        }
    }
    
    animate();
    
    try {
        const audio = new Audio('data:audio/wav;base64,U3RlYWx0aCBzb3VuZA==');
        audio.play().catch(() => {});
    } catch(e) {}
}

function onBadgeEarned(badgeName) {
    showConfetti();
    showToast(`🏆 ${badgeName} Unlocked! 🎉`, '#f59e0b');
}

// ===================== COPY TO CLIPBOARD FUNCTIONS =====================
function showCopyNotification(message, type = 'success') {
    const existing = document.querySelector('.copy-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `copy-notification ${type}`;
    
    let icon = 'fa-check-circle';
    if (message.includes('phone')) icon = 'fa-phone';
    if (message.includes('link') || message.includes('profile')) icon = 'fa-link';
    if (message.includes('contact')) icon = 'fa-clipboard-list';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2500);
    
    if (navigator.vibrate) navigator.vibrate(50);
}

window.copyPhoneNumber = function(phone, workerName) {
    const cleanPhone = phone.replace(/\D/g, '');
    navigator.clipboard.writeText(cleanPhone).then(() => {
        showCopyNotification(`📞 ${workerName}'s number copied!`, 'success');
    }).catch(() => {
        showCopyNotification('❌ Failed to copy number', 'error');
    });
}

window.copyProfileLink = function(workerId, workerName) {
    const url = `${window.location.origin}/worker-detail.html?id=${workerId}`;
    navigator.clipboard.writeText(url).then(() => {
        showCopyNotification(`🔗 ${workerName}'s profile link copied!`, 'info');
    }).catch(() => {
        showCopyNotification('❌ Failed to copy link', 'error');
    });
}

window.copyAllContactInfo = function(worker) {
    const contactInfo = `📋 CONTACT DETAILS - ${worker.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 Phone: ${worker.phone}
📍 Location: ${worker.location}
💼 Skills: ${worker.skills.join(', ')}
💰 Rate: ${worker.rate}
⭐ Rating: ${worker.rating}/5.0
━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Via HireNepal - Find Local Talent in Pokhara`;
    
    navigator.clipboard.writeText(contactInfo).then(() => {
        showCopyNotification(`✅ Complete contact info for ${worker.name} copied!`, 'success');
    }).catch(() => {
        showCopyNotification('❌ Failed to copy', 'error');
    });
}
// ===================== CONFETTI EFFECT =====================
function showConfetti() {
    // Check if canvas is supported
    if (typeof document === 'undefined') return;
    
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10000';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#fbbf24', '#ef4444', '#8b5cf6'];
    
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            rotation: Math.random() * 360,
            spin: Math.random() * 10 - 5
        });
    }
    
    let animationId;
    let startTime = Date.now();
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let allFinished = true;
        for (let p of particles) {
            if (p.y < canvas.height + 50) {
                allFinished = false;
                p.y += p.speed;
                p.rotation += p.spin;
                
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                ctx.restore();
            }
        }
        
        if (allFinished || Date.now() - startTime > 3000) {
            cancelAnimationFrame(animationId);
            canvas.remove();
        } else {
            animationId = requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Make it globally available
window.showConfetti = showConfetti;
// Offline detection
window.addEventListener('online', () => {
    showToast('📡 Back online!', '#10b981');
});

window.addEventListener('offline', () => {
    showToast('⚠️ You are offline. Some features may not work.', '#ef4444');
});
function validateForm(formId, rules) {
    const form = document.getElementById(formId);
    if (!form) return true;
    
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            input.style.borderColor = '';
        }
    });
    
    return isValid;
}