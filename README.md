# JSON Explorer

A simple web application to load and explore JSON data in a "file/folder" style interface.  
-> [Click here to open the JSON Explorer page](https://mariusbiller.github.io/JSON-Explorer/)

## Features

1. **Open JSON**:
   - Click the **Open** button to select and load a local JSON file.
   - Optionally, you can pass a JSON link as a URL query parameter (explained below).
2. **Expand/Collapse All**: Quickly expand or collapse all nested structures.
3. **Search**: Filters the JSON by matching keys or stringified values.
4. **Dynamic Rendering**: Provides different icons for strings, numbers, booleans, and objects/arrays.

## How to Use (Local File)

1. **Open `index.html`** in a modern web browser.
2. Click the **Open** button in the top navbar to choose a `.json` file from your local machine.
3. Browse the rendered content; click on folders to expand or collapse items.
4. Use the search box to filter results in real time.
5. Use the **Expand** and **Collapse** buttons to open or close all levels at once.

## How to Use (Remote JSON via Query Parameter)

Instead of loading a local file, you can pass a remote JSON link directly in the URL.  
For example:

```
https://mariusbiller.github.io/JSON-Explorer/?link=<MY-AWSOME-JSON-LINK>
```

**Example Usage**:  
```
https://mariusbiller.github.io/JSON-Explorer/?link=https://dummyjson.com/products
```

Here, the `?link=` parameter will be read by the app, and the JSON at the given URL will automatically be fetched and displayed.
