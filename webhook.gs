/**
 * Crypto Blog WebApp - Google Apps Script Webhook
 * This script serves as a backend for the Crypto Blog, fetching article data from Google Sheets.
 */

function doGet() {
  // Get the spreadsheet and specific sheet containing articles
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const articlesSheet = spreadsheet.getSheetByName("Articles");
  
  // If sheet doesn't exist, return an error
  if (!articlesSheet) {
    return ContentService.createTextOutput(JSON.stringify({
      error: "Articles sheet not found"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Get all data from the sheet
  const data = articlesSheet.getDataRange().getValues();
  
  // If there's no data or only headers, return an empty array
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Extract headers (first row)
  const headers = data[0];
  
  // Initialize articles array
  const articles = [];
  
  // Loop through rows (skip header row)
  for (let i = 1; i < data.length; i++) {
    // Skip empty rows
    if (data[i].every(cell => cell === "")) continue;
    
    // Create article object
    const article = {};
    
    // Map each column to the appropriate field in the article object
    for (let j = 0; j < headers.length; j++) {
      // Make sure all fields exist, even if empty
      const fieldName = headers[j] || `field${j}`;
      
      // Special handling for date field
      if (fieldName === 'date') {
        // Ensure the date is in ISO format string
        if (data[i][j] instanceof Date) {
          article[fieldName] = data[i][j].toISOString();
        } else if (data[i][j]) {
          // If it's not a Date object but not empty, try to convert
          try {
            const dateObj = new Date(data[i][j]);
            article[fieldName] = dateObj.toISOString();
          } catch (e) {
            // If date parsing fails, use current date
            article[fieldName] = new Date().toISOString();
          }
        } else {
          // If no date provided, use current date
          article[fieldName] = new Date().toISOString();
        }
      } else {
        // For non-date fields
        article[fieldName] = data[i][j] || "";
      }
    }
    
    // Add article to array
    articles.push(article);
  }
  
  // Sort articles by date (newest first)
  articles.sort((a, b) => {
    // Handle missing dates safely
    if (!a.date) return 1;
    if (!b.date) return -1;
    
    // Parse dates and sort
    return new Date(b.date) - new Date(a.date);
  });
  
  // Set CORS headers to allow access from any origin
  const output = ContentService.createTextOutput(JSON.stringify(articles))
    .setMimeType(ContentService.MimeType.JSON);
  
  return output;
}

/**
 * Test function to check if the script works properly
 */
function testDoGet() {
  const result = doGet();
  Logger.log(result.getContent());
}

/**
 * Setup function to create a sample sheet if it doesn't exist
 * Run this manually to set up a template sheet
 */
function setupSampleSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName("Articles");
  
  // Create the sheet if it doesn't exist
  if (!sheet) {
    sheet = spreadsheet.insertSheet("Articles");
    
    // Add headers
    sheet.appendRow(["title", "content", "date", "author"]);
    
    // Current date for the article
    const currentDate = new Date();
    
    // Add a sample article
    sheet.appendRow([
      "Introduction to Cryptocurrency", 
      "# Introduction to Cryptocurrency\n\nCryptocurrency is a **digital or virtual currency** that uses cryptography for security. It operates on a technology called *blockchain*, which is a distributed ledger enforced by a network of computers.\n\n## Key Features\n\n* Decentralization\n* Security through cryptography\n* Global accessibility\n\n> \"Bitcoin is the first decentralized cryptocurrency.\"\n\nLearn more about [Bitcoin](https://bitcoin.org).", 
      currentDate, 
      "Crypto Expert"
    ]);
    
    // Add another sample article from a week ago
    const olderDate = new Date();
    olderDate.setDate(olderDate.getDate() - 7);
    
    sheet.appendRow([
      "Ethereum and Smart Contracts", 
      "# Ethereum and Smart Contracts\n\nEthereum is a decentralized platform that runs **smart contracts** - applications that run exactly as programmed without possibility of downtime, censorship, fraud, or third-party interference.\n\n## Why Ethereum Matters\n\n* Programmable blockchain\n* Wide ecosystem of dApps\n* Large developer community\n\nLearn more about [Ethereum](https://ethereum.org).", 
      olderDate, 
      "Blockchain Developer"
    ]);
    
    // Format headers
    sheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#f3f3f3");
    
    // Set date column format to ensure proper date representation
    sheet.getRange(2, 3, sheet.getLastRow(), 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, 4);
  }
  
  Logger.log("Sample sheet setup complete with multiple articles!");
}

/**
 * This function must be run manually to deploy the script as a web app
 * It logs the URL you need to use in your index.html
 */
function getDeploymentURL() {
  const url = ScriptApp.getService().getUrl();
  Logger.log("Deploy this script as a web app and use this URL in your index.html:");
  Logger.log(url);
} 