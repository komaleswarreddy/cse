# Deploying to Netlify

This document provides step-by-step instructions for deploying the CSE6 Poll System to Netlify.

## Prerequisites

- A GitHub account
- A Netlify account (you can sign up for free at [netlify.com](https://www.netlify.com/))

## Deployment Steps

### Option 1: Deploy via Netlify UI (Recommended for beginners)

1. **Login to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com/) and log in with your account

2. **Create a new site**
   - Click on the "Add new site" button
   - Select "Import an existing project"

3. **Connect to GitHub**
   - Choose GitHub as your Git provider
   - Authorize Netlify to access your GitHub repositories
   - Select the repository containing your CSE6 Poll System

4. **Configure build settings**
   - Base directory: Leave empty (or specify the directory if your site is not in the root)
   - Build command: Leave empty (this is a static site with no build required)
   - Publish directory: `/` (the root of your project)
   - Click "Deploy site"

5. **Wait for deployment**
   - Netlify will deploy your site and provide a unique URL
   - You can set up a custom domain in the site settings if desired

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install netlify-cli -g
   ```

2. **Login to Netlify via CLI**
   ```bash
   netlify login
   ```

3. **Initialize Netlify in your project**
   ```bash
   cd /path/to/your/project
   netlify init
   ```

4. **Follow the prompts to configure your site**
   - Choose "Create & configure a new site"
   - Select your team
   - Provide a site name if desired

5. **Deploy the site**
   ```bash
   netlify deploy --prod
   ```

## Post-Deployment Configuration

- **Custom domain**: Configure your custom domain in Netlify's site settings
- **HTTPS**: Netlify automatically provides SSL certificates for your site
- **Environment variables**: If needed, set environment variables in Netlify's site settings

## Continuous Deployment

Your site will automatically redeploy when you push changes to the connected GitHub repository.

## Troubleshooting

- If you encounter issues with page routing, check the redirects in the `netlify.toml` file
- For further assistance, refer to [Netlify's documentation](https://docs.netlify.com/) 