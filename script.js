/**
 * OD Drive Campaign Generator
 * Professional JavaScript implementation with modular structure
 */

// ===== CONFIGURATION =====
const CONFIG = {
  WEBHOOK_URL: 'https://hook.us2.make.com/7oibqbjdcjbhjrayxruwc0a73f73if8i',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/png', 'image/jpeg'],
  PRODUCT_OPTIONS: [
    { value: 'OD_VT', label: 'OD VT' },
    { value: 'OD_DROP', label: 'OD DROP' },
    { value: 'OD_PACK', label: 'OD PACK' },
    { value: 'OD_FULL', label: 'OD FULL' },
    { value: 'OD_LIGHT', label: 'OD LIGHT' }
  ]
};

// ===== UTILITY FUNCTIONS =====
class Utils {
  /**
   * Show status message to user
   * @param {string} text - Message text
   * @param {boolean} isSuccess - Whether message is success or error
   */
  static showMessage(text, isSuccess = true) {
    const msgElement = document.getElementById('msg');
    msgElement.textContent = text;
    msgElement.className = `status-message ${isSuccess ? 'success' : 'error'}`;
    msgElement.classList.remove('hidden');
  }

  /**
   * Hide status message
   */
  static hideMessage() {
    const msgElement = document.getElementById('msg');
    msgElement.classList.add('hidden');
  }

  /**
   * Validate file type and size
   * @param {File} file - File to validate
   * @returns {Object} Validation result
   */
  static validateFile(file) {
    if (!file) {
      return { valid: false, message: 'Nenhum arquivo selecionado' };
    }

    if (!CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
      return { valid: false, message: 'Tipo de arquivo não permitido. Use PNG ou JPG.' };
    }

    if (file.size > CONFIG.MAX_FILE_SIZE) {
      return { valid: false, message: 'Arquivo muito grande. Máximo 10MB.' };
    }

    return { valid: true };
  }

  /**
   * Format currency value
   * @param {number} value - Value to format
   * @returns {string} Formatted currency
   */
  static formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}

// ===== PRODUCT MANAGER =====
class ProductManager {
  constructor() {
    this.productCount = 0;
    this.productWrapper = document.getElementById('product_wrapper');
    this.addProductBtn = document.getElementById('addProduct');
    
    this.init();
  }

  init() {
    // Add first product (without remove button)
    this.addProduct(false);
    
    // Bind add product button
    this.addProductBtn.addEventListener('click', () => {
      this.addProduct(true);
    });
  }

  /**
   * Create a new product form element
   * @param {boolean} showRemove - Whether to show remove button
   * @returns {HTMLElement} Product form element
   */
  createProductElement(showRemove = true) {
    this.productCount++;
    const productId = this.productCount;

    const wrapper = document.createElement('div');
    wrapper.className = 'product-item';
    wrapper.dataset.productId = productId;

    const grid = document.createElement('div');
    grid.className = 'product-grid';

    // Product Select Field
    const productField = this.createSelectField(
      'Produto',
      `product_${productId}`,
      'product[]',
      CONFIG.PRODUCT_OPTIONS
    );

    // Unit Price Field
    const priceField = this.createInputField(
      'Preço unitário (R$)',
      'number',
      'unit_price[]',
      { step: '0.01', min: '0', placeholder: 'Preço' }
    );

    // Quantity Field
    const quantityField = this.createInputField(
      'Qtd carros',
      'number',
      'cars_qtd[]',
      { min: '1', placeholder: 'Qtd' }
    );

    // Discount Field
    const discountField = this.createInputField(
      'Desconto (R$)',
      'number',
      'discount[]',
      { step: '0.01', min: '0', value: '0', placeholder: 'Desconto' }
    );

    // Append fields to grid
    grid.appendChild(productField);
    grid.appendChild(priceField);
    grid.appendChild(quantityField);
    grid.appendChild(discountField);

    wrapper.appendChild(grid);

    // Add remove button if needed
    if (showRemove) {
      const removeBtn = this.createRemoveButton();
      removeBtn.addEventListener('click', () => {
        wrapper.remove();
      });
      wrapper.appendChild(removeBtn);
    }

    return wrapper;
  }

  /**
   * Create a select field
   * @param {string} label - Field label
   * @param {string} id - Field ID
   * @param {string} name - Field name
   * @param {Array} options - Select options
   * @returns {HTMLElement} Select field element
   */
  createSelectField(label, id, name, options) {
    const field = document.createElement('div');
    field.className = 'product-field';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.className = 'product-label';
    labelEl.setAttribute('for', id);

    const select = document.createElement('select');
    select.id = id;
    select.name = name;
    select.required = true;
    select.className = 'product-select';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = 'Selecione';
    select.appendChild(defaultOption);

    // Add options
    options.forEach(option => {
      const optionEl = document.createElement('option');
      optionEl.value = option.value;
      optionEl.textContent = option.label;
      select.appendChild(optionEl);
    });

    field.appendChild(labelEl);
    field.appendChild(select);

    return field;
  }

  /**
   * Create an input field
   * @param {string} label - Field label
   * @param {string} type - Input type
   * @param {string} name - Field name
   * @param {Object} attributes - Additional attributes
   * @returns {HTMLElement} Input field element
   */
  createInputField(label, type, name, attributes = {}) {
    const field = document.createElement('div');
    field.className = 'product-field';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.className = 'product-label';

    const input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.required = true;
    input.className = 'product-input';

    // Set additional attributes
    Object.entries(attributes).forEach(([key, value]) => {
      input.setAttribute(key, value);
    });

    field.appendChild(labelEl);
    field.appendChild(input);

    return field;
  }

  /**
   * Create remove button
   * @returns {HTMLElement} Remove button element
   */
  createRemoveButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.title = 'Remover produto';
    button.className = 'remove-product-btn';
    button.innerHTML = '<i data-lucide="x-circle" class="w-5 h-5 text-red-500"></i>';
    
    return button;
  }

  /**
   * Add a new product to the form
   * @param {boolean} showRemove - Whether to show remove button
   */
  addProduct(showRemove = true) {
    const productElement = this.createProductElement(showRemove);
    this.productWrapper.appendChild(productElement);
    
    // Reinitialize Lucide icons
    lucide.createIcons();
  }

  /**
   * Get all products data
   * @returns {Array} Array of product objects
   */
  getProductsData() {
    const products = [];
    const productItems = this.productWrapper.querySelectorAll('.product-item');

    productItems.forEach((item, index) => {
      const productSelect = item.querySelector('select[name="product[]"]');
      const priceInput = item.querySelector('input[name="unit_price[]"]');
      const quantityInput = item.querySelector('input[name="cars_qtd[]"]');
      const discountInput = item.querySelector('input[name="discount[]"]');

      if (productSelect && priceInput && quantityInput && discountInput) {
        const product = {
          produto: productSelect.value,
          preco: parseFloat(priceInput.value) || 0,
          qtd: parseInt(quantityInput.value) || 0,
          desconto: parseFloat(discountInput.value) || 0
        };

        if (product.produto && product.preco > 0 && product.qtd > 0) {
          products.push(product);
        }
      }
    });

    return products;
  }
}

// ===== FILE UPLOAD MANAGER =====
class FileUploadManager {
  constructor() {
    this.uploadArea = document.getElementById('uploadArea');
    this.fileInput = document.getElementById('mockup_image');
    this.uploadContent = this.uploadArea.querySelector('.upload-content');
    this.filePreview = this.uploadArea.querySelector('.file-preview');
    this.fileName = this.uploadArea.querySelector('.file-name');
    
    this.init();
  }

  init() {
    // Click to upload
    this.uploadArea.addEventListener('click', () => {
      this.fileInput.click();
    });

    // Drag and drop events
    this.uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadArea.classList.add('dragover');
    });

    this.uploadArea.addEventListener('dragleave', () => {
      this.uploadArea.classList.remove('dragover');
    });

    this.uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadArea.classList.remove('dragover');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileSelection(files[0]);
      }
    });

    // File input change
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileSelection(e.target.files[0]);
      }
    });
  }

  /**
   * Handle file selection
   * @param {File} file - Selected file
   */
  handleFileSelection(file) {
    const validation = Utils.validateFile(file);
    
    if (!validation.valid) {
      Utils.showMessage(`❌ ${validation.message}`, false);
      return;
    }

    this.updateFilePreview(file);
    
    // Update file input
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    this.fileInput.files = dataTransfer.files;
  }

  /**
   * Update file preview display
   * @param {File} file - Selected file
   */
  updateFilePreview(file) {
    this.uploadContent.classList.add('hidden');
    this.filePreview.classList.remove('hidden');
    this.fileName.textContent = file.name;
  }

  /**
   * Reset file upload state
   */
  reset() {
    this.uploadContent.classList.remove('hidden');
    this.filePreview.classList.add('hidden');
    this.fileName.textContent = '';
    this.fileInput.value = '';
  }

  /**
   * Get selected file
   * @returns {File|null} Selected file or null
   */
  getSelectedFile() {
    return this.fileInput.files[0] || null;
  }
}

// ===== FORM MANAGER =====
class FormManager {
  constructor() {
    this.form = document.getElementById('odForm');
    this.submitBtn = this.form.querySelector('button[type="submit"]');
    this.originalSubmitText = this.submitBtn.innerHTML;
    
    this.productManager = new ProductManager();
    this.fileUploadManager = new FileUploadManager();
    
    this.init();
  }

  init() {
    // Form submission
    this.form.addEventListener('submit', (e) => {
      this.handleSubmit(e);
    });

    // Input animations
    this.initInputAnimations();
  }

  /**
   * Initialize input animations and interactions
   */
  initInputAnimations() {
    const inputs = this.form.querySelectorAll('input');
    
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
      });
      
      input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
      });
    });
  }

  /**
   * Handle form submission
   * @param {Event} event - Submit event
   */
  async handleSubmit(event) {
    event.preventDefault();
    Utils.hideMessage();

    try {
      // Validate form data
      const validation = this.validateForm();
      if (!validation.valid) {
        Utils.showMessage(`❌ ${validation.message}`, false);
        return;
      }

      // Show loading state
      this.setLoadingState(true);

      // Prepare form data
      const formData = this.prepareFormData();

      // Submit to webhook
      const response = await this.submitToWebhook(formData);

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
      }

      // Success
      Utils.showMessage('✅ Dados enviados com sucesso!');
      this.resetForm();

    } catch (error) {
      console.error('Form submission error:', error);
      Utils.showMessage(`❌ Erro ao enviar: ${error.message}`, false);
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Validate form data
   * @returns {Object} Validation result
   */
  validateForm() {
    // Validate file
    const file = this.fileUploadManager.getSelectedFile();
    const fileValidation = Utils.validateFile(file);
    if (!fileValidation.valid) {
      return { valid: false, message: fileValidation.message };
    }

    // Validate products
    const products = this.productManager.getProductsData();
    if (products.length === 0) {
      return { valid: false, message: 'Adicione pelo menos um produto' };
    }

    // Validate required fields
    const requiredFields = this.form.querySelectorAll('[required]');
    for (const field of requiredFields) {
      if (!field.value.trim()) {
        return { valid: false, message: `Campo obrigatório: ${field.placeholder || field.name}` };
      }
    }

    return { valid: true };
  }

  /**
   * Prepare form data for submission
   * @returns {FormData} Prepared form data
   */
  prepareFormData() {
    const formData = new FormData();
    
    // Basic form fields
    formData.set('company_name', this.form.company_name.value);
    formData.set('site_url', this.form.site_url.value);
    formData.set('city', this.form.city.value);
    formData.set('campaign_days', this.form.campaign_days.value);
    
    // Products data
    const products = this.productManager.getProductsData();
    formData.set('products', JSON.stringify(products));
    
    // File
    const file = this.fileUploadManager.getSelectedFile();
    formData.set('mockup_image', file);

    return formData;
  }

  /**
   * Submit form data to webhook
   * @param {FormData} formData - Form data to submit
   * @returns {Promise<Response>} Fetch response
   */
  async submitToWebhook(formData) {
    return fetch(CONFIG.WEBHOOK_URL, {
      method: 'POST',
      body: formData
    });
  }

  /**
   * Set loading state for submit button
   * @param {boolean} isLoading - Whether form is loading
   */
  setLoadingState(isLoading) {
    if (isLoading) {
      this.submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-6 h-6 animate-spin"></i> Enviando...';
      this.submitBtn.disabled = true;
    } else {
      this.submitBtn.innerHTML = this.originalSubmitText;
      this.submitBtn.disabled = false;
    }
    
    // Reinitialize Lucide icons
    lucide.createIcons();
  }

  /**
   * Reset form to initial state
   */
  resetForm() {
    this.form.reset();
    this.fileUploadManager.reset();
    
    // Reset products to initial state
    this.productManager.productWrapper.innerHTML = '';
    this.productManager.productCount = 0;
    this.productManager.addProduct(false);
  }
}

// ===== APPLICATION INITIALIZATION =====
class ODDriveApp {
  constructor() {
    this.init();
  }

  init() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Initialize form manager
    this.formManager = new FormManager();
    
    // Add any global event listeners or initialization here
    this.initGlobalEvents();
  }

  /**
   * Initialize global events
   */
  initGlobalEvents() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Reinitialize icons when page becomes visible
        lucide.createIcons();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      // Add any resize handling logic here
    });
  }
}

// ===== START APPLICATION =====
document.addEventListener('DOMContentLoaded', () => {
  new ODDriveApp();
});

