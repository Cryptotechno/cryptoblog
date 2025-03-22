/**
 * Enhanced Google Apps Script for Crypto Blog
 * This script serves content from a Google Sheet as a JSON API
 * Now with added SEO optimization fields and multiple article support
 */

// The doGet function handles HTTP GET requests to your web app
function doGet(e) {
  try {
    // Check if sitemap is requested
    if (e && e.parameter && e.parameter.format === 'sitemap') {
      return generateSitemap();
    }
    
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
 * 5. Update the apiUrl in your index.html to use this web app URL
 * 
 * 6. For sitemap generation:
 *    - Access the sitemap XML at [your-web-app-url]?format=sitemap
 */

// Example Markdown content for first article
const EXAMPLE_CONTENT = `
# Bitcoin: The Future of Money

Bitcoin has revolutionized the way we think about currency in the digital age. As a decentralized digital currency, it operates without a central bank or single administrator, allowing peer-to-peer transactions without intermediaries.

## How Bitcoin Works

Bitcoin uses a technology called **blockchain**, which is a decentralized ledger of all transactions across a peer-to-peer network. This means:

1. No central authority controls Bitcoin
2. Transactions are transparent
3. Users remain pseudo-anonymous

\`\`\`javascript
// Example of a Bitcoin transaction
const transaction = {
  sender: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  recipient: "15KYnxwN5rSAkPSH6BqNgNPWVY7xm3cpdK",
  amount: 5.0
};
\`\`\`

## The Impact on Traditional Banking

Bitcoin and other cryptocurrencies are challenging the traditional banking system in several ways:

* Eliminating the need for intermediaries
* Reducing transaction costs
* Providing financial services to the unbanked
* Offering an alternative to inflation-prone fiat currencies

> "Bitcoin is a remarkable cryptographic achievement and the ability to create something that is not duplicable in the digital world has enormous value." - Eric Schmidt, former CEO of Google

![Bitcoin Graph](https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800)

## Getting Started with Bitcoin

If you're interested in Bitcoin, here are some ways to get started:

1. Learn about wallets and security
2. Consider dollar-cost averaging for investing
3. Stay informed about regulatory changes
4. Understand the tax implications

For more information, check out [bitcoin.org](https://bitcoin.org).
`;

// Second example article content
const EXAMPLE_CONTENT_2 = `
# Understanding Ethereum and Smart Contracts

Ethereum has emerged as one of the most significant blockchain platforms, enabling developers to build decentralized applications (dApps) through smart contracts.

## What are Smart Contracts?

Smart contracts are self-executing contracts where the terms are directly written into code. Benefits include:

* Automation without intermediaries
* Immutability and transparency
* Reduced costs and increased efficiency

\`\`\`solidity
// Simple Ethereum smart contract example
contract SimpleStorage {
    uint storedData;
    
    function set(uint x) public {
        storedData = x;
    }
    
    function get() public view returns (uint) {
        return storedData;
    }
}
\`\`\`

## Ethereum's Ecosystem

Ethereum has fostered a diverse ecosystem including:

1. Decentralized Finance (DeFi) applications
2. Non-Fungible Tokens (NFTs)
3. Decentralized Autonomous Organizations (DAOs)
4. Layer 2 scaling solutions

> "Ethereum is a global, open-source platform for decentralized applications." - Vitalik Buterin, Ethereum co-founder

## The Future of Ethereum

With Ethereum 2.0 and the shift to Proof of Stake, the platform is evolving to address:

* Scalability challenges
* Energy consumption concerns
* Enhanced security
* Improved user experience

For developers looking to build on Ethereum, check out [ethereum.org](https://ethereum.org).
`;

// Third example article content
const EXAMPLE_CONTENT_3 = `
# NFTs: Digital Ownership Revolution in the Crypto Space

Non-Fungible Tokens (NFTs) have exploded in popularity, creating an entirely new paradigm for digital ownership. Unlike cryptocurrencies such as Bitcoin or Ethereum, where each token is identical to another, NFTs are unique digital assets that represent ownership of specific items.

## What Makes NFTs Unique?

NFTs derive their value from several key characteristics:

* **Uniqueness**: Each NFT has distinct information that makes it irreplaceable and impossible to exchange at equivalency
* **Indivisibility**: NFTs cannot be divided into smaller denominations
* **Provenance**: Complete ownership history is permanently recorded on the blockchain
* **Programmability**: Smart contracts can enable various functionalities like royalties

\`\`\`javascript
// Example of NFT metadata
const nftMetadata = {
  name: "Digital Masterpiece #1",
  description: "A one-of-a-kind digital artwork",
  image: "ipfs://QmXYZ...",
  attributes: [
    { trait_type: "Artist", value: "CryptoCreator" },
    { trait_type: "Year", value: 2023 }
  ]
};
\`\`\`

## NFT Use Cases Beyond Digital Art

While digital art has dominated NFT headlines, the technology has far broader applications:

1. **Gaming assets**: In-game items that players truly own
2. **Virtual real estate**: Land parcels in metaverse platforms
3. **Music and media**: Royalty-sharing music NFTs
4. **Identity and certification**: Verifiable credentials and certificates
5. **Ticketing**: Event tickets with programmable resale conditions

> "NFTs fundamentally change the relationship between creators and their audience by removing intermediaries and enabling direct patronage." - Digital art collector

![NFT Marketplace](https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800)

## The Future of NFTs

As the technology matures, we're likely to see:

* Increased utility beyond collectibility
* Environmental concerns addressed through layer-2 solutions and proof-of-stake
* Integration with physical world assets
* Improved user experience for mainstream adoption
* Regulatory frameworks evolving to address new ownership paradigms

For creators looking to enter the NFT space, focus on creating genuine value and community engagement rather than speculative hype. The most sustainable NFT projects will be those that solve real problems or provide meaningful experiences.

Learn more about creating your own NFTs at [opensea.io](https://opensea.io).
`;

// Example spreadsheet setup instructions:
/*
Row 1 (Headers):
title | content | date | author | description | tags | image | keywords | canonicalUrl

Row 2 (Example article 1):
Bitcoin: The Future of Money | [EXAMPLE_CONTENT] | 2023-05-15 | Satoshi Nakamoto | An exploration of how Bitcoin is changing the future of financial transactions and what it means for traditional banking | cryptocurrency,bitcoin,blockchain | https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800 | bitcoin, cryptocurrency, blockchain, digital currency | 

Row 3 (Example article 2):
Understanding Ethereum and Smart Contracts | [EXAMPLE_CONTENT_2] | 2023-06-22 | Vitalik Buterin | Learn about Ethereum's smart contract capability and how it's creating a new ecosystem of decentralized applications | ethereum,smart contracts,dapps | https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800 | ethereum, smart contracts, dapps, blockchain, defi |

Row 4 (Example article 3):
NFTs: Digital Ownership Revolution in the Crypto Space | [EXAMPLE_CONTENT_3] | 2023-07-10 | Alex Johnson | Exploring how NFTs are transforming digital ownership and creating new opportunities for creators and collectors | nft,digital art,collectibles | https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800 | nft, non-fungible tokens, digital art, blockchain, digital ownership |
*/
