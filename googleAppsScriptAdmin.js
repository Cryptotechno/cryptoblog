/**
 * Enhanced Google Apps Script for Crypto Blog Admin
 * This script handles adding new articles to a Google Sheet from the admin panel
 */

// The doGet function handles HTTP GET requests to your web app
function doGet(e) {
  return handleRequest(e);
}

// The doPost function handles HTTP POST requests to your web app
function doPost(e) {
  return handleRequest(e);
}

// Common handler for both GET and POST requests
function handleRequest(e) {
  try {
    // Handle CORS preflight requests
    if (e.method === 'OPTIONS') {
      return handleCorsRequest();
    }
    
    // Check if the request is a POST for adding an article
    if (e.method === 'POST' && e.postData) {
      return addArticle(e);
    }
    
    // Check if sitemap is requested
    if (e && e.parameter && e.parameter.format === 'sitemap') {
      return generateSitemap();
    }
    
    // By default, return all articles
    return getAllArticles();
    
  } catch (error) {
    // Handle any errors
    return ContentService.createTextOutput(JSON.stringify({
      error: 'An error occurred: ' + error.message
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .addHeader('Access-Control-Allow-Origin', '*');
  }
}

// Handle CORS preflight requests
function handleCorsRequest() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .addHeader('Access-Control-Allow-Origin', '*')
    .addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .addHeader('Access-Control-Allow-Headers', 'Content-Type')
    .addHeader('Access-Control-Max-Age', '3600');
}

// Add a new article to the spreadsheet
function addArticle(e) {
  try {
    // Parse the JSON data from the POST request
    const json = e.postData.contents;
    const data = JSON.parse(json);
    
    // Validate required fields
    if (!data.title || !data.content || !data.date) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Missing required fields: title, content, date'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader('Access-Control-Allow-Origin', '*');
    }
    
    // Get active spreadsheet and the sheet containing articles
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Articles');
    
    // Get headers from the first row
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Check if we have the expected headers
    const requiredColumns = [
      'title', 'content', 'date', 'author', 'description', 'tags', 'image', 'keywords'
    ];
    
    // Create a new row for the article
    const newRow = [];
    
    // Fill the row with data based on headers
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i].toLowerCase();
      
      // Match the header with data field
      if (data[header] !== undefined) {
        newRow.push(data[header]);
      } else {
        // If field is missing, add an empty value
        newRow.push('');
      }
    }
    
    // Add the new row to the sheet
    sheet.appendRow(newRow);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Article added successfully'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .addHeader('Access-Control-Allow-Origin', '*');
    
  } catch (error) {
    // Handle any errors
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Error adding article: ' + error.message
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .addHeader('Access-Control-Allow-Origin', '*');
  }
}

// Get all articles from the spreadsheet
function getAllArticles() {
  try {
    // Get active spreadsheet and the sheet containing articles
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Articles');
    
    // Get all data from the sheet (including headers)
    const data = sheet.getDataRange().getValues();
    
    // Extract headers (first row)
    const headers = data[0];
    
    // Initialize an array to store all articles
    const articles = [];
    
    // Process each row (excluding header row)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows (check if title is empty)
      if (!row[0]) continue;
      
      // Create an article object
      const article = {};
      
      // Map data to corresponding fields using headers
      for (let j = 0; j < headers.length; j++) {
        // Convert header to camelCase for JSON convention
        const header = headers[j].toLowerCase();
        article[header] = row[j];
      }
      
      // Add article to array
      articles.push(article);
    }
    
    // Return articles as JSON with CORS headers
    return ContentService.createTextOutput(JSON.stringify(articles))
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader('Access-Control-Allow-Origin', '*');
      
  } catch (error) {
    // Handle any errors
    return ContentService.createTextOutput(JSON.stringify({
      error: 'An error occurred: ' + error.message
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .addHeader('Access-Control-Allow-Origin', '*');
  }
}

/**
 * Generate a sitemap XML based on articles in the spreadsheet
 */
function generateSitemap() {
  try {
    // Get active spreadsheet and the sheet containing articles
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Articles');
    
    // Get all data from the sheet (including headers)
    const data = sheet.getDataRange().getValues();
    
    // Extract headers (first row)
    const headers = data[0];
    
    // Find title and date column indexes
    const titleIndex = headers.indexOf('title');
    const dateIndex = headers.indexOf('date');
    
    // Base URL for the blog
    const baseUrl = 'https://cryptotechno.github.io/cryptoblog/';
    
    // Start building the sitemap XML
    let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add home page
    sitemapXml += '  <url>\n';
    sitemapXml += '    <loc>' + baseUrl + '</loc>\n';
    sitemapXml += '    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n';
    sitemapXml += '    <changefreq>weekly</changefreq>\n';
    sitemapXml += '    <priority>1.0</priority>\n';
    sitemapXml += '  </url>\n';
    
    // Process each row (excluding header row)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row[titleIndex]) continue;
      
      // Get title and create slug
      const title = row[titleIndex];
      const slug = title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
      
      // Get date (or use today if not available)
      const date = row[dateIndex] ? new Date(row[dateIndex]) : new Date();
      const formattedDate = date.toISOString().split('T')[0];
      
      // Add article URL
      sitemapXml += '  <url>\n';
      sitemapXml += '    <loc>' + baseUrl + '?article=' + slug + '</loc>\n';
      sitemapXml += '    <lastmod>' + formattedDate + '</lastmod>\n';
      sitemapXml += '    <changefreq>monthly</changefreq>\n';
      sitemapXml += '    <priority>0.8</priority>\n';
      sitemapXml += '  </url>\n';
    }
    
    sitemapXml += '</urlset>';
    
    // Return sitemap XML
    return ContentService.createTextOutput(sitemapXml)
      .setMimeType(ContentService.MimeType.XML)
      .addHeader('Access-Control-Allow-Origin', '*');
    
  } catch (error) {
    // Handle any errors
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Error generating sitemap: ' + error.message
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .addHeader('Access-Control-Allow-Origin', '*');
  }
}

/**
 * Instructions for setting up this Google Apps Script:
 * 
 * 1. Create a new Google Sheet
 * 2. Create a sheet named "Articles"
 * 3. Add the following column headers in row 1:
 *    - title: The article title
 *    - content: The article content in Markdown format
 *    - date: Publication date (YYYY-MM-DD format)
 *    - author: The author's name
 *    - description: SEO-friendly description (max 160 chars)
 *    - tags: Comma-separated list of tags
 *    - image: URL to featured image for the article
 *    - keywords: SEO keywords (comma-separated)
 *    - canonicalUrl: (Optional) Canonical URL if article exists elsewhere
 * 
 * 4. Deploy this script as a web app:
 *    - Click "Deploy" > "New deployment"
 *    - Set "Execute as" to "Me"
 *    - Set "Who has access" to "Anyone"
 *    - Click "Deploy"
 *    - Copy the web app URL
 * 
 * 5. Update the apiUrl in your index.html and admin.html to use this web app URL
 * 
 * 6. For sitemap generation:
 *    - Access the sitemap XML at [your-web-app-url]?format=sitemap
 * 
 * 7. For adding articles via the admin panel:
 *    - Send a POST request to [your-web-app-url] with the article data as JSON
 */ 