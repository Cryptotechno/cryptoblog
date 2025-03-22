# Crypto Blog MVP

A minimal, lightweight crypto blog that fetches articles from Google Sheets using a Google Apps Script webhook.

## Features

- Single HTML file solution - no frameworks or build tools
- Fetches articles from Google Sheets via Apps Script webhook
- Renders Markdown content using marked.js
- Styles content with GitHub-style Markdown via github-markdown-css

## Setup Instructions

1. Replace the placeholder URL in `index.html` with your Google Apps Script webhook URL
   ```javascript
   const apiUrl = '[PASTE YOUR SCRIPT URL HERE]';
   ```

2. Upload the `index.html` file to your web server or GitHub Pages

## Expected Google Sheets / Apps Script Response Format

The webhook should return JSON in the following format:

```json
[
  {
    "title": "Article Title",
    "content": "# Markdown Content\n\nThis is a paragraph with **bold** and *italic* text.",
    "date": "2023-04-15T14:30:00Z",
    "author": "Author Name"
  },
  {
    "title": "Another Article",
    "content": "# Another Article\n\nMore content here...",
    "date": "2023-04-10T10:15:00Z",
    "author": "Another Author"
  }
]
```

The most recent article (first in the array) will be displayed on the homepage.

## Google Apps Script Setup (Example)

If you need to set up the Google Apps Script webhook, here's a simple example:

```javascript
function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Articles");
  const data = sheet.getDataRange().getValues();
  
  const headers = data[0];
  const articles = [];
  
  // Convert sheet data to JSON
  for (let i = 1; i < data.length; i++) {
    const article = {};
    for (let j = 0; j < headers.length; j++) {
      article[headers[j]] = data[i][j];
    }
    articles.push(article);
  }
  
  // Sort by date (newest first)
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Return JSON response
  return ContentService.createTextOutput(JSON.stringify(articles))
    .setMimeType(ContentService.MimeType.JSON);
}
```

With Google Sheets columns: `title`, `content`, `date`, `author` 