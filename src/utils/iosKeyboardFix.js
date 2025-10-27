/**
 * iOS PWA Standalone Mode Keyboard Fix
 * 
 * This utility addresses the issue where the virtual keyboard doesn't appear
 * when tapping input fields in iOS PWA standalone mode.
 */

// Detect if running in iOS PWA standalone mode
const isIOSPWAMode = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    window.navigator.standalone === true
  );
};

// Detect if running in iOS Safari
const isIOSSafari = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    window.navigator.standalone === false
  );
};

// Force focus and keyboard display for input elements
const forceInputFocus = (inputElement) => {
  if (!inputElement) return;
  
  // For iOS PWA standalone mode, we need to use a different approach
  if (isIOSPWAMode()) {
    // Create a temporary input to trigger keyboard
    const tempInput = document.createElement('input');
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    tempInput.style.top = '-9999px';
    tempInput.style.opacity = '0';
    tempInput.style.pointerEvents = 'none';
    tempInput.style.fontSize = '16px'; // Prevent zoom
    
    document.body.appendChild(tempInput);
    
    // Focus the temporary input first to trigger keyboard
    tempInput.focus();
    
    // Small delay to ensure keyboard is triggered
    setTimeout(() => {
      // Remove temporary input
      document.body.removeChild(tempInput);
      
      // Focus the actual input
      inputElement.focus();
      
      // Ensure the input is visible and properly positioned
      inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  } else {
    // Normal focus for other browsers
    inputElement.focus();
  }
};

// Add click handlers to input elements
const addInputClickHandlers = () => {
  // Handle Material-UI TextField inputs
  const textFieldInputs = document.querySelectorAll('.MuiInputBase-input, .MuiOutlinedInput-input');
  
  textFieldInputs.forEach(input => {
    // Remove existing handlers to avoid duplicates
    input.removeEventListener('click', handleInputClick);
    input.removeEventListener('touchstart', handleInputTouch);
    
    // Add new handlers
    input.addEventListener('click', handleInputClick);
    input.addEventListener('touchstart', handleInputTouch);
  });
  
  // Handle regular input elements
  const regularInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea');
  
  regularInputs.forEach(input => {
    // Skip if already handled
    if (input.classList.contains('MuiInputBase-input') || input.classList.contains('MuiOutlinedInput-input')) {
      return;
    }
    
    // Remove existing handlers to avoid duplicates
    input.removeEventListener('click', handleInputClick);
    input.removeEventListener('touchstart', handleInputTouch);
    
    // Add new handlers
    input.addEventListener('click', handleInputClick);
    input.addEventListener('touchstart', handleInputTouch);
  });
};

// Handle input click events
const handleInputClick = (event) => {
  if (isIOSPWAMode()) {
    event.preventDefault();
    event.stopPropagation();
    
    // Force focus with our custom method
    forceInputFocus(event.target);
  }
};

// Handle input touch events
const handleInputTouch = (event) => {
  if (isIOSPWAMode()) {
    event.preventDefault();
    event.stopPropagation();
    
    // Force focus with our custom method
    forceInputFocus(event.target);
  }
};

// Initialize the keyboard fix
export const initializeIOSKeyboardFix = () => {
  // Only run on iOS devices
  if (!/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    return;
  }
  
  // Add initial handlers
  addInputClickHandlers();
  
  // Re-add handlers when new content is loaded (for SPA navigation)
  const observer = new MutationObserver((mutations) => {
    let shouldReinitialize = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any input elements were added
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.matches && (
              node.matches('input, textarea') ||
              node.querySelector('input, textarea')
            )) {
              shouldReinitialize = true;
            }
          }
        });
      }
    });
    
    if (shouldReinitialize) {
      // Small delay to ensure DOM is fully updated
      setTimeout(() => {
        addInputClickHandlers();
      }, 100);
    }
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Cleanup function
  return () => {
    observer.disconnect();
  };
};

// Export utility functions
export {
  isIOSPWAMode,
  isIOSSafari,
  forceInputFocus,
  addInputClickHandlers
};
