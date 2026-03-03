/**
 * Quick Add Drawer JavaScript
 * Handles opening/closing the drawer, variant selection, and adding to cart
 */

class QuickAddDrawer {
  constructor() {
    this.drawers = [];
    this.init();
  }

  init() {
    // Initialize all quick add buttons
    this.initQuickAddButtons();
    
    // Initialize all close buttons
    this.initCloseButtons();
    
    // Initialize variant selection
    this.initVariantSelection();
    
    // Initialize quantity selectors
    this.initQuantitySelectors();
    
    // Initialize add to cart forms
    this.initAddToCartForms();
  }

  initQuickAddButtons() {
    const quickAddButtons = document.querySelectorAll('.product-card__quick-add');
    
    quickAddButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const productId = button.getAttribute('data-product-id');
        this.openDrawer(productId);
      });
    });
  }

  initCloseButtons() {
    const closeButtons = document.querySelectorAll('[data-drawer-close]');
    
    closeButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const drawer = button.closest('.quick-add-drawer');
        this.closeDrawer(drawer);
      });
    });
  }

  initVariantSelection() {
    // Color swatches
    const colorSwatches = document.querySelectorAll('.quick-add-drawer__color-swatch');
    
    colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', (event) => {
        event.preventDefault();
        this.selectVariant(swatch, 'color');
      });
    });

    // Size options
    const sizeOptions = document.querySelectorAll('.quick-add-drawer__size-option');
    
    sizeOptions.forEach(option => {
      option.addEventListener('click', (event) => {
        event.preventDefault();
        this.selectVariant(option, 'size');
      });
    });

    // Select dropdowns
    const selectDropdowns = document.querySelectorAll('.quick-add-drawer__select');
    
    selectDropdowns.forEach(select => {
      select.addEventListener('change', (event) => {
        this.updateVariantFromSelect(select);
      });
    });
  }

  initQuantitySelectors() {
    const quantityInputs = document.querySelectorAll('.quantity__input');
    
    quantityInputs.forEach(input => {
      const form = input.closest('form');
      const minusButton = form.querySelector('.quantity__button[name="minus"]');
      const plusButton = form.querySelector('.quantity__button[name="plus"]');
      
      minusButton.addEventListener('click', () => {
        const currentValue = parseInt(input.value) || 1;
        const newValue = Math.max(1, currentValue - 1);
        input.value = newValue;
      });
      
      plusButton.addEventListener('click', () => {
        const currentValue = parseInt(input.value) || 1;
        const newValue = currentValue + 1;
        input.value = newValue;
      });
    });
  }

  initAddToCartForms() {
    const addToCartForms = document.querySelectorAll('form[action="/cart/add"]');
    
    addToCartForms.forEach(form => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.addToCart(form);
      });
    });
  }

  openDrawer(productId) {
    const drawer = document.getElementById(`QuickAddDrawer-${productId}`);
    
    if (drawer) {
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      
      // Focus on the drawer content for accessibility
      const drawerContent = drawer.querySelector('.quick-add-drawer__content');
      if (drawerContent) {
        drawerContent.focus();
      }
    }
  }

  closeDrawer(drawer) {
    if (drawer) {
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  selectVariant(element, type) {
    const drawer = element.closest('.quick-add-drawer');
    const value = element.getAttribute('data-value');
    const variantId = element.getAttribute('data-variant-id');
    
    // Update selected state
    const siblings = drawer.querySelectorAll(`.quick-add-drawer__${type === 'color' ? 'color-swatch' : 'size-option'}`);
    siblings.forEach(sibling => {
      sibling.classList.remove('selected');
    });
    element.classList.add('selected');
    
    // Update hidden variant input
    const variantInput = drawer.querySelector('[data-variant-input]');
    if (variantInput) {
      variantInput.value = variantId;
    }
    
    // Update price and availability
    this.updateDrawerInfo(drawer, variantId);
  }

  updateVariantFromSelect(select) {
    const drawer = select.closest('.quick-add-drawer');
    const form = select.closest('form');
    const selectedOption = select.options[select.selectedIndex];
    const variantId = this.getVariantIdFromOptions(form);
    
    // Update hidden variant input
    const variantInput = drawer.querySelector('[data-variant-input]');
    if (variantInput) {
      variantInput.value = variantId;
    }
    
    // Update price and availability
    this.updateDrawerInfo(drawer, variantId);
  }

  getVariantIdFromOptions(form) {
    const selects = form.querySelectorAll('.quick-add-drawer__select');
    const options = Array.from(selects).map(select => select.value);
    
    // This is a simplified approach - in a real implementation, 
    // you would need to match the selected options to the correct variant
    // For now, we'll just return the first available variant
    const variantInput = form.querySelector('[data-variant-input]');
    return variantInput ? variantInput.value : '';
  }

  updateDrawerInfo(drawer, variantId) {
    // In a real implementation, you would fetch the variant data
    // and update the price and availability accordingly
    // For now, this is a placeholder
  }

  addToCart(form) {
    const submitButton = form.querySelector('.quick-add-drawer__add-to-cart');
    const originalText = submitButton.textContent;
    
    // Show loading state
    submitButton.textContent = 'Adding...';
    submitButton.disabled = true;
    
    // Prepare form data
    const formData = new FormData(form);
    
    // Add to cart using Shopify's AJAX API
    fetch('/cart/add.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.status && data.status >= 400) {
        throw new Error(data.description);
      }
      
      // Update cart count
      this.updateCartCount();
      
      // Show success message
      submitButton.textContent = 'Added!';
      
      // Close drawer after a short delay
      setTimeout(() => {
        const drawer = form.closest('.quick-add-drawer');
        this.closeDrawer(drawer);
        
        // Reset button text
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }, 1000);
    })
    .catch(error => {
      console.error('Error adding to cart:', error);
      
      // Show error message
      submitButton.textContent = 'Error';
      
      // Reset button text after a short delay
      setTimeout(() => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }, 2000);
    });
  }

  updateCartCount() {
    // Fetch cart data to update the cart count
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
          element.textContent = cart.item_count;
        });
      })
      .catch(error => {
        console.error('Error updating cart count:', error);
      });
  }
}

// Initialize the Quick Add Drawer when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  new QuickAddDrawer();
});

// Handle escape key to close drawer
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const openDrawer = document.querySelector('.quick-add-drawer[aria-hidden="false"]');
    if (openDrawer) {
      const closeButtons = openDrawer.querySelectorAll('[data-drawer-close]');
      if (closeButtons.length > 0) {
        closeButtons[0].click();
      }
    }
  }
});