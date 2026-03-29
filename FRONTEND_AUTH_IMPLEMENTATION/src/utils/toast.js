/**
 * Toast notification utility
 * Provides simple toast notifications for user feedback
 */

// Store active toasts
let toastContainer = null;
let toastId = 0;

/**
 * Get or create toast container
 */
function getToastContainer() {
  if (toastContainer) return toastContainer;
  
  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    pointer-events: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  `;
  
  if (typeof document !== 'undefined') {
    document.body.appendChild(toastContainer);
  }
  
  return toastContainer;
}

/**
 * Create and display a toast notification
 * @param {object} options - Toast options
 * @param {string} options.title - Toast title
 * @param {string} options.message - Toast message
 * @param {string} options.type - Toast type: 'success', 'error', 'info', 'warning' (default: 'info')
 * @param {number} options.duration - Duration in ms (default: 3000)
 */
function showToast({ title, message, type = 'info', duration = 3000 }) {
  if (typeof document === 'undefined') return;
  
  const container = getToastContainer();
  const id = toastId++;
  
  // Create toast element
  const toast = document.createElement('div');
  toast.id = `toast-${id}`;
  
  // Color scheme based on type
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b'
  };
  
  const bgColors = {
    success: '#ecfdf5',
    error: '#fef2f2',
    info: '#eff6ff',
    warning: '#fffbeb'
  };
  
  const borderColors = {
    success: '#d1fae5',
    error: '#fee2e2',
    info: '#dbeafe',
    warning: '#fef3c7'
  };
  
  const color = colors[type] || colors.info;
  const bgColor = bgColors[type] || bgColors.info;
  const borderColor = borderColors[type] || borderColors.info;
  
  toast.style.cssText = `
    background-color: ${bgColor};
    border: 1px solid ${borderColor};
    border-left: 4px solid ${color};
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 12px;
    min-width: 300px;
    max-width: 500px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease-out;
    pointer-events: auto;
  `;
  
  // Create content
  const content = document.createElement('div');
  content.style.cssText = `
    display: flex;
    gap: 12px;
    align-items: flex-start;
  `;
  
  // Icon
  const icon = document.createElement('div');
  icon.style.cssText = `
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${color};
    font-weight: bold;
    font-size: 16px;
    margin-top: 2px;
  `;
  
  const iconText = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };
  
  icon.textContent = iconText[type] || '•';
  
  // Text content
  const textContent = document.createElement('div');
  textContent.style.cssText = `
    flex: 1;
    color: #1f2937;
  `;
  
  if (title) {
    const titleEl = document.createElement('div');
    titleEl.style.cssText = `
      font-weight: 600;
      margin-bottom: ${message ? '4px' : '0'};
      color: ${color};
    `;
    titleEl.textContent = title;
    textContent.appendChild(titleEl);
  }
  
  if (message) {
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      font-size: 14px;
      color: #6b7280;
      line-height: 1.4;
    `;
    messageEl.textContent = message;
    textContent.appendChild(messageEl);
  }
  
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = `
    flex-shrink: 0;
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    margin-top: -2px;
    transition: color 0.2s;
  `;
  closeBtn.textContent = '×';
  closeBtn.onmouseover = () => closeBtn.style.color = '#6b7280';
  closeBtn.onmouseout = () => closeBtn.style.color = '#9ca3af';
  closeBtn.onclick = () => removeToast(id);
  
  content.appendChild(icon);
  content.appendChild(textContent);
  content.appendChild(closeBtn);
  
  toast.appendChild(content);
  container.appendChild(toast);
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  if (!document.querySelector('style[data-toast-animations]')) {
    style.setAttribute('data-toast-animations', 'true');
    document.head.appendChild(style);
  }
  
  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }
  
  return id;
}

/**
 * Remove a toast notification
 */
function removeToast(id) {
  if (typeof document === 'undefined') return;
  
  const toast = document.getElementById(`toast-${id}`);
  if (!toast) return;
  
  toast.style.animation = 'slideOut 0.3s ease-out';
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

/**
 * Toast API object
 */
export const Toast = {
  /**
   * Show success toast
   * @param {object} options - Toast options
   */
  success: (options) => showToast({ ...options, type: 'success' }),
  
  /**
   * Show error toast
   * @param {object} options - Toast options
   */
  error: (options) => showToast({ ...options, type: 'error' }),
  
  /**
   * Show info toast
   * @param {object} options - Toast options
   */
  info: (options) => showToast({ ...options, type: 'info' }),
  
  /**
   * Show warning toast
   * @param {object} options - Toast options
   */
  warning: (options) => showToast({ ...options, type: 'warning' }),
  
  /**
   * Show custom toast
   * @param {object} options - Toast options with type property
   */
  show: (options) => showToast(options)
};

export default Toast;
