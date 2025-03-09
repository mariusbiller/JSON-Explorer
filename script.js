/*************************************
 * 1. On Page Load: Check URL Param
 *************************************/
window.addEventListener('DOMContentLoaded', () => {
    const keyFromUrl = getKeyFromUrl();
    if (!keyFromUrl) return; 
    loadJsonFromSessionStorage(keyFromUrl);
  });
  
  /** Helper to get 'key' parameter from current URL. */
  function getKeyFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('key');
  }
  
  /**
   * Loads JSON from sessionStorage by key and displays it in #fileBrowser.
   */
  function loadJsonFromSessionStorage(key) {
    const stored = sessionStorage.getItem(key);
    if (!stored) {
      console.warn(`No data found for sessionStorage key: "${key}"`);
      return;
    }
    try {
      const data = JSON.parse(stored);
      const fileBrowser = document.getElementById("fileBrowser");
      fileBrowser.innerHTML = ""; // Clear old content
      createBrowserContent(data, fileBrowser);
    } catch (err) {
      console.error("Error parsing JSON from sessionStorage:", err);
    }
  }
  
  /*************************************
   * 2. Build JSON File Browser
   *************************************/
  function createBrowserContent(json, parentElement) {
    for (const key in json) {
      if (!Object.prototype.hasOwnProperty.call(json, key)) continue;
      const value = json[key];
      const type = typeof value;
  
      switch (type) {
        case "string": {
          const file = document.createElement("div");
          file.className = "list-group-item file d-flex align-items-center";
          file.innerHTML = `
            <i class="bi bi-file-earmark"></i>
            <span class="ms-1 file-key">${key}</span>
            <span class="file-value value-string">${value}</span>
          `;
          parentElement.appendChild(file);
          break;
        }
  
        case "number": {
          const file = document.createElement("div");
          file.className = "list-group-item file d-flex align-items-center";
          file.innerHTML = `
            <i class="bi bi-123"></i>
            <span class="ms-1 file-key">${key}</span>
            <span class="file-value value-number">${value}</span>
          `;
          parentElement.appendChild(file);
          break;
        }
  
        case "boolean": {
          const file = document.createElement("div");
          file.className = "list-group-item file d-flex align-items-center";
          const iconClass = value ? "bi-toggle-on" : "bi-toggle-off";
          file.innerHTML = `
            <i class="bi ${iconClass}"></i>
            <span class="ms-1 file-key">${key}</span>
            <span class="file-value value-boolean">${value}</span>
          `;
          parentElement.appendChild(file);
          break;
        }
  
        case "object": {
          // Handle null
          if (value === null) {
            const file = document.createElement("div");
            file.className = "list-group-item file d-flex align-items-center";
            file.innerHTML = `
              <i class="bi bi-file-earmark"></i>
              <span class="ms-1 file-key">${key}</span>
              <span class="file-value value-string">null</span>
            `;
            parentElement.appendChild(file);
          } else {
            // Create a "folder"
            const folder = document.createElement("div");
            folder.className = "list-group-item folder d-flex align-items-center";
            folder.innerHTML = `
              <i class="bi bi-folder"></i>
              <span class="ms-1 file-key">${key}</span>
              <span class="file-value value-folder">...</span>
            `;
            folder.dataset.folder = key;
  
            // Hidden sub-content
            const folderContent = document.createElement("div");
            folderContent.className = "folder-content hidden";
  
            // Toggle logic
            folder.addEventListener("click", () => {
              folderContent.classList.toggle("hidden");
              folder.querySelector("i").className = folderContent.classList.contains("hidden")
                ? "bi bi-folder"
                : "bi bi-folder2-open";
            });
  
            parentElement.appendChild(folder);
            parentElement.appendChild(folderContent);
  
            // Recursively build the structure
            createBrowserContent(value, folderContent);
          }
          break;
        }
  
        default: {
          // For other types (symbol, undefined, function, etc.)
          const defaultFile = document.createElement("div");
          defaultFile.className = "list-group-item file d-flex align-items-center";
          defaultFile.innerHTML = `
            <i class="bi bi-file-earmark"></i>
            <span class="ms-1 file-key">${key}</span>
            <span class="file-value">${String(value)}</span>
          `;
          parentElement.appendChild(defaultFile);
        }
      }
    }
  }
  
  /*************************************
   * 3. Handle File Input (Upload)
   *************************************/
  const fileInput = document.getElementById("jsonFile");
  fileInput.addEventListener("change", async (evt) => {
    const file = evt.target.files[0];
    if (!file) return;
  
    await processFileAndUpdateURL(file);
    // Close modal
    closeModal("#openModal");
  });
  
  /** Reads a file, stores it in sessionStorage, updates URL, loads data. */
  async function processFileAndUpdateURL(file) {
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      const key = file.name;
      // Store in sessionStorage
      sessionStorage.setItem(key, JSON.stringify(jsonData));
      // Update URL query param
      updateUrlQueryParam(key);
      // Load data from sessionStorage
      loadJsonFromSessionStorage(key);
    } catch (err) {
      alert("Error reading or parsing the JSON file.");
      console.error(err);
    }
  }
  
  /*************************************
   * 4. Handle Drag & Drop
   *************************************/
  const dropZone = document.getElementById("dropZone");
  
  dropZone.addEventListener("dragover", (evt) => {
    evt.preventDefault();
    dropZone.classList.add("dragover");
  });
  
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });
  
  dropZone.addEventListener("drop", async (evt) => {
    evt.preventDefault();
    dropZone.classList.remove("dragover");
  
    const file = evt.dataTransfer.files[0];
    if (!file) return;
  
    await processFileAndUpdateURL(file);
    // Close modal
    closeModal("#openModal");
  });
  
  /*************************************
   * 5. Helper: Update the Browser URL
   *************************************/
  function updateUrlQueryParam(keyValue) {
    const baseUrl = window.location.origin + window.location.pathname;
    const newUrl = `${baseUrl}?key=${encodeURIComponent(keyValue)}`;
    // Change the URL without reloading the page
    window.history.replaceState({}, "", newUrl);
  }
  
  /*************************************
   * 6. Helper: Close the Bootstrap Modal
   *************************************/
  function closeModal(selector) {
    const modalEl = document.querySelector(selector);
    if (!modalEl) return;
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }