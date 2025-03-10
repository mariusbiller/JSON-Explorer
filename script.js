/******************************************************
 * GLOBAL: Store current JSON so we can re-render
 ******************************************************/
let loadedJson = null; // <-- ADDED

/******************************************************
 * 1. On Page Load: Check ?link=... and fetch JSON
 ******************************************************/
window.addEventListener('DOMContentLoaded', () => {
  const linkParam = getLinkFromUrl();
  if (!linkParam) return; // Guard clause: no link => do nothing
  fetchJsonAndDisplay(linkParam);
});

/** Returns the 'link' parameter from ?link=... */
function getLinkFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("link");
}

/** Fetch JSON from remote and display it. */
async function fetchJsonAndDisplay(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    loadedJson = data; // <-- ADDED
    const fileBrowser = document.getElementById("fileBrowser");
    fileBrowser.innerHTML = ""; // Clear previous

    // Render with folders collapsed by default
    createBrowserContent(data, fileBrowser, /* expand= */ false);
  } catch (err) {
    console.error("Error fetching/parsing remote JSON:", err);
  }
}

/******************************************************
 * 2. File Input & Drag/Drop => Display JSON
 ******************************************************/

/** Handle file input change */
document.getElementById("jsonFile").addEventListener("change", (evt) => {
  const file = evt.target.files[0];
  if (!file) return; // Guard clause
  parseFileAndDisplay(file);
  closeModal("#openModal");
});

/** Drag & Drop handlers */
const dropZone = document.getElementById("dropZone");

dropZone.addEventListener("dragover", (evt) => {
  evt.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (evt) => {
  evt.preventDefault();
  dropZone.classList.remove("dragover");

  const file = evt.dataTransfer.files[0];
  if (!file) return; // Guard clause
  parseFileAndDisplay(file);
  closeModal("#openModal");
});

/** Reads a file, parses JSON, displays it */
function parseFileAndDisplay(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const jsonData = JSON.parse(reader.result);
      loadedJson = jsonData; // <-- ADDED
      const fileBrowser = document.getElementById("fileBrowser");
      fileBrowser.innerHTML = ""; // Clear

      // Render with folders collapsed by default
      createBrowserContent(jsonData, fileBrowser, /* expand= */ false);
    } catch (err) {
      alert("Invalid JSON file.");
      console.error(err);
    }
  };
  reader.readAsText(file);
}

/*************************************
 * 3. Build JSON File Browser
 *************************************/
/**
 * Create UI for the given JSON object/array. 
 * @param {Object|Array} json - The JSON data
 * @param {HTMLElement} parentElement - Where to attach
 * @param {boolean} expand - Whether all folders should start expanded
 */
function createBrowserContent(json, parentElement, expand = false) {
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
          folderContent.className = "folder-content";
          
          // NEW: If expand==false, keep hidden; if expand==true, show folder
          if (!expand) {
            folderContent.classList.add("hidden");
          } else {
            folder.querySelector("i").className = "bi bi-folder2-open";
          }

          // Toggle logic on click
          folder.addEventListener("click", () => {
            folderContent.classList.toggle("hidden");
            folder.querySelector("i").className = folderContent.classList.contains("hidden")
              ? "bi bi-folder"
              : "bi bi-folder2-open";
          });

          parentElement.appendChild(folder);
          parentElement.appendChild(folderContent);

          // Recursively build the structure
          createBrowserContent(value, folderContent, expand);
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

/******************************************************
 * 4. Close the Bootstrap Modal Helper
 ******************************************************/
function closeModal(selector) {
  const modalEl = document.querySelector(selector);
  if (!modalEl) return; // Guard clause

  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();
}

/******************************************************
 * 5. EXPAND / COLLAPSE ALL
 ******************************************************/
document.getElementById("expandAllBtn").addEventListener("click", () => {
  if (!loadedJson) return; // No JSON loaded yet
  const fileBrowser = document.getElementById("fileBrowser");
  fileBrowser.innerHTML = "";
  createBrowserContent(loadedJson, fileBrowser, /* expand= */ true);
});

document.getElementById("collapseAllBtn").addEventListener("click", () => {
  if (!loadedJson) return; // No JSON loaded yet
  const fileBrowser = document.getElementById("fileBrowser");
  fileBrowser.innerHTML = "";
  createBrowserContent(loadedJson, fileBrowser, /* expand= */ false);
});