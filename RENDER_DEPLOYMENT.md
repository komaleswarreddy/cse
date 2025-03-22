# Render Deployment Guide for CSE6 Poll System

This guide explains how to deploy the CSE6 Poll System to Render.

## Prerequisites

1. A [Render account](https://render.com/)
2. Your code in a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### Step 1: Sign up for Render

If you haven't already, sign up for a Render account at https://render.com/.

### Step 2: Connect Your Repository

1. In your Render dashboard, click on "New" and select "Blueprint" to deploy using the `render.yaml` file.
2. Connect to your Git provider (GitHub, GitLab, etc.) and select your repository.
3. Render will automatically detect the `render.yaml` file and configure your services.

### Step 3: Configure Environment Variables

1. You'll need to manually set the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key

2. To set these:
   - Go to your backend service (cse6-poll-api) in the Render dashboard
   - Click on "Environment" in the left sidebar
   - Add the variables and their values
   - Click "Save Changes"

### Step 4: Deploy

1. Render will automatically deploy both your frontend and backend services.
2. Wait for the deployment to complete (may take a few minutes).
3. You can monitor the deployment logs in the Render dashboard.

### Step 5: Testing

1. Once deployed, Render will provide URLs for your services.
2. Test the application by visiting the frontend URL.
3. Ensure that API calls are working correctly.

## Troubleshooting

- **Frontend can't connect to backend**: Check that the API_URL in your frontend code is correct.
- **Database connection issues**: Verify the MONGODB_URI environment variable is set correctly.
- **Server errors**: Check the logs in the Render dashboard for any error messages.

## Maintenance

- Render automatically redeploys when you push changes to your Git repository.
- You can manually redeploy from the Render dashboard as needed.

## Notes

- The free tier of Render has limitations:
  - Services may spin down after periods of inactivity
  - Limited compute resources
  - If you need more reliable service, consider upgrading to a paid plan.

- To update environment variables, go to the Environment section in the Render dashboard. 