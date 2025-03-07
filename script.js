// Fetch the JSON data from data.json
fetch('data.json')
  .then(response => response.json())
  .then(fileSystem => {
    const fileBrowser = document.getElementById("fileBrowser");
    createBrowserContent(fileSystem, fileBrowser);
  })
  .catch(error => console.error('Error loading JSON:', error));

// Recursive function to build the file browser structure
function createBrowserContent(json, parentElement) {
  for (const key in json) {
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
        // Handle null separately to avoid rendering a folder for null
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
          // Create a folder
          const folder = document.createElement("div");
          folder.className = "list-group-item folder d-flex align-items-center";
          folder.innerHTML = `
            <i class="bi bi-folder"></i>
            <span class="ms-1 file-key">${key}</span>
            <span class="file-value value-folder">...</span>
          `;
          folder.dataset.folder = key;

          const folderContent = document.createElement("div");
          folderContent.className = "folder-content hidden";

          folder.addEventListener("click", () => {
            folderContent.classList.toggle("hidden");
            folder.querySelector("i").className = folderContent.classList.contains("hidden")
              ? "bi bi-folder"
              : "bi bi-folder2-open";
          });

          parentElement.appendChild(folder);
          parentElement.appendChild(folderContent);

          // Recursively build structure inside this folder
          createBrowserContent(value, folderContent);
        }
        break;
      }

      default:
        // For any other case not covered above (symbol, function, etc.)
        const defaultFile = document.createElement("div");
        defaultFile.className = "list-group-item file d-flex align-items-center";
        defaultFile.innerHTML = `
          <i class="bi bi-file-earmark"></i>
          <span class="ms-1 file-key">${key}</span>
          <span class="file-value">${value}</span>
        `;
        parentElement.appendChild(defaultFile);
    }
  }
}