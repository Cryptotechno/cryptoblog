# GitHub Pages Deployment Instructions

Follow these steps to deploy your Crypto Blog to GitHub Pages:

## 1. Go to your GitHub repository

Visit: https://github.com/Cryptotechno/cryptoblog

## 2. Upload the files

Click on "Add file" → "Upload files" and upload these files:
- `index.html`
- `README.md`
- `.nojekyll` (this is a hidden file, make sure to include it)

## 3. Create GitHub workflow

1. On GitHub, click "Add file" → "Create new file"
2. Enter filename: `.github/workflows/pages.yml`
3. Copy and paste this content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Pages
        uses: actions/configure-pages@v3
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: '.'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

4. Click "Commit new file"

## 4. Enable GitHub Pages

1. Go to your repository's "Settings" tab
2. Click on "Pages" in the left sidebar
3. Under "Build and deployment", select:
   - Source: GitHub Actions

## 5. Wait for deployment

1. Go to the "Actions" tab to see deployment progress
2. Once complete, your site will be live at: https://cryptotechno.github.io/cryptoblog/

That's it! Your crypto blog is now deployed to GitHub Pages. 