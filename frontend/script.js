// Initialize Lucide icons
lucide.createIcons();

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const fileInput = document.getElementById('fileInput');
  const uploadArea = document.getElementById('uploadArea');
  const fileNameDisplay = document.getElementById('fileName');
  const fileInfo = document.getElementById('fileInfo');
  const submitBtn = document.getElementById('submitBtn');
  const errorMsg = document.getElementById('errorMsg');
  
  const setupSection = document.getElementById('setupSection');
  const loadingSection = document.getElementById('loadingSection');
  const resultsSection = document.getElementById('resultsSection');
  const resultsContent = document.getElementById('resultsContent');
  const resetBtn = document.getElementById('resetBtn');

  let currentFile = null;
  let isDarkMode = false;

  // Theme Toggle Logic
  themeToggleBtn.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      themeIcon.setAttribute('data-lucide', 'sun');
    } else {
      document.body.classList.remove('dark-theme');
      themeIcon.setAttribute('data-lucide', 'moon');
    }
    lucide.createIcons(); // Re-render the icon
  });

  // Drag and Drop Logic
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('active');
  });

  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('active');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('active');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  });

  function handleFileSelection(file) {
    if (file.type !== 'application/pdf') {
      showError('Please upload a PDF file.');
      currentFile = null;
      updateFileUI();
      return;
    }
    
    hideError();
    currentFile = file;
    updateFileUI();
  }

  function updateFileUI() {
    if (currentFile) {
      fileNameDisplay.textContent = currentFile.name;
      fileInfo.classList.remove('d-none');
      fileInfo.classList.add('d-flex');
      submitBtn.disabled = false;
    } else {
      fileInfo.classList.add('d-none');
      fileInfo.classList.remove('d-flex');
      submitBtn.disabled = true;
      fileInput.value = ''; // clear input
    }
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('d-none');
  }

  function hideError() {
    errorMsg.classList.add('d-none');
  }

  // API Call Logic
  submitBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    hideError();
    setupSection.classList.add('d-none');
    loadingSection.classList.remove('d-none');

    const formData = new FormData();
    formData.append('file', currentFile);

    try {
      // Send request to backend
      const response = await fetch('http://localhost:8000/api/analyze-resume', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        showResults(data.results);
      } else {
        throw new Error(data.detail || 'Failed to analyze the resume. Unexpected response format.');
      }
    } catch (err) {
      console.error(err);
      loadingSection.classList.add('d-none');
      setupSection.classList.remove('d-none');
      showError(err.message || 'An error occurred while connecting to the server.');
    }
  });

  function showResults(markdownText) {
    loadingSection.classList.add('d-none');
    resultsSection.classList.remove('d-none');
    
    // Parse markdown to HTML
    resultsContent.innerHTML = marked.parse(markdownText);
  }

  // Reset Logic
  resetBtn.addEventListener('click', () => {
    currentFile = null;
    updateFileUI();
    hideError();
    
    resultsSection.classList.add('d-none');
    setupSection.classList.remove('d-none');
  });
});
