/******************************************************
 * GLOBAL: Store current JSON so we can re-render
 ******************************************************/
let loadedJson = null;

/******************************************************
 * 1. On Page Load: Check ?link=... and fetch JSON
 ******************************************************/
window.addEventListener('DOMContentLoaded', () => {
  const linkParam = getLinkFromUrl();
  if (!linkParam) return; // No link => do nothing
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
    loadedJson = data;
    const fileBrowser = document.getElementById("fileBrowser");
    fileBrowser.innerHTML = "";
    // Render with folders collapsed by default
    createBrowserContent(data, fileBrowser, false);
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
  if (!file) return;
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
  if (!file) return;
  parseFileAndDisplay(file);
  closeModal("#openModal");
});

/** Reads a file, parses JSON, displays it */
function parseFileAndDisplay(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const jsonData = JSON.parse(reader.result);
      loadedJson = jsonData;
      const fileBrowser = document.getElementById("fileBrowser");
      fileBrowser.innerHTML = "";
      // Render with folders collapsed by default
      createBrowserContent(jsonData, fileBrowser, false);
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
 * Create UI for the given JSON data.
 * @param {Object|Array} json - The JSON data.
 * @param {HTMLElement} parentElement - Element to attach content.
 * @param {boolean} expand - Whether folders should be expanded.
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
        // Handle null value
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
          // Create folder element for objects/arrays
          const folder = document.createElement("div");
          folder.className = "list-group-item folder d-flex align-items-center";
          folder.innerHTML = `
            <i class="bi bi-folder"></i>
            <span class="ms-1 file-key">${key}</span>
            <span class="file-value value-folder">...</span>
          `;
          folder.dataset.folder = key;

          // Folder content container
          const folderContent = document.createElement("div");
          folderContent.className = "folder-content";
          if (!expand) {
            folderContent.classList.add("hidden");
          } else {
            folder.querySelector("i").className = "bi bi-folder2-open";
          }

          // Toggle folder open/close on click
          folder.addEventListener("click", () => {
            folderContent.classList.toggle("hidden");
            folder.querySelector("i").className = folderContent.classList.contains("hidden")
              ? "bi bi-folder"
              : "bi bi-folder2-open";
          });

          parentElement.appendChild(folder);
          parentElement.appendChild(folderContent);
          // Recursively build sub-content
          createBrowserContent(value, folderContent, expand);
        }
        break;
      }

      default: {
        // For other types (undefined, function, etc.)
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
  if (!modalEl) return;
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();
}

/******************************************************
 * 5. EXPAND / COLLAPSE ALL
 ******************************************************/
document.getElementById("expandAllBtn").addEventListener("click", () => {
  if (!loadedJson) return;
  const fileBrowser = document.getElementById("fileBrowser");
  fileBrowser.innerHTML = "";
  createBrowserContent(loadedJson, fileBrowser, true);
});

document.getElementById("collapseAllBtn").addEventListener("click", () => {
  if (!loadedJson) return;
  const fileBrowser = document.getElementById("fileBrowser");
  fileBrowser.innerHTML = "";
  createBrowserContent(loadedJson, fileBrowser, false);
});

/******************************************************
 * 6. SEARCH FUNCTIONALITY
 *    Re-render the JSON in "expand all" mode filtering for keys/values that include the search term.
 ******************************************************/
document.getElementById("searchInput").addEventListener("input", () => {
  const searchTerm = document.getElementById("searchInput").value.trim();
  const fileBrowser = document.getElementById("fileBrowser");
  fileBrowser.innerHTML = "";
  if (!loadedJson) return;
  if (searchTerm === "") {
    // If search input is cleared, show the full JSON in expanded mode.
    createBrowserContent(loadedJson, fileBrowser, true);
  } else {
    // Filter the loaded JSON based on the search term.
    const filtered = filterJson(loadedJson, searchTerm) || {};
    createBrowserContent(filtered, fileBrowser, true);
  }
});

/******************************************************
 * 7. Helper: Filter JSON by search term
 *    Recursively returns a version of the JSON that includes only keys or values matching the search term.
 ******************************************************/
function filterJson(json, searchTerm) {
  if (!searchTerm) return json;
  searchTerm = searchTerm.toLowerCase();

  if (typeof json !== "object" || json === null) {
    // For primitive values, check if they include the search term.
    return String(json).toLowerCase().includes(searchTerm) ? json : undefined;
  }

  // For arrays, filter each element.
  if (Array.isArray(json)) {
    const filteredArray = json
      .map(item => filterJson(item, searchTerm))
      .filter(item => item !== undefined);
    return filteredArray.length > 0 ? filteredArray : undefined;
  }

  // For objects, build a new object with matching keys/values.
  const filteredObj = {};
  Object.keys(json).forEach(key => {
    const value = json[key];
    const keyMatches = key.toLowerCase().includes(searchTerm);
    const filteredValue = filterJson(value, searchTerm);
    if (keyMatches || filteredValue !== undefined) {
      filteredObj[key] = filteredValue !== undefined ? filteredValue : value;
    }
  });

  return Object.keys(filteredObj).length > 0 ? filteredObj : undefined;
}