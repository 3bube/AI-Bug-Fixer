# TaskTracker Deployment Guide for Render

This guide provides instructions for deploying the TaskTracker backend to Render.

## Prerequisites

1. A [Render](https://render.com/) account
2. Your TaskTracker repository on GitHub
3. Access to your database (PostgreSQL)

## Deployment Steps

### Step 1: Create a Render Secret Group

1. Log in to your Render Dashboard
2. Go to the "Secrets" section in the top navigation bar
3. Click "New Secret Group" and name it `tasktracker-secrets`
4. Add the following secrets:
   - `GITHUB_WEBHOOK_SECRET` - Your GitHub webhook secret
   - `SUPABASE_URL` - Your Supabase URL
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `DATABASE_URL` - Your PostgreSQL connection string

### Step 2: Deploy from GitHub

1. Log in to your Render Dashboard
2. Click "New" button in the top right corner
3. Select "Blueprint" from the dropdown
4. Connect your GitHub repository
5. Render will detect the `render.yaml` file and prompt you to deploy the services defined in it
6. Click "Apply" to begin the deployment process
7. Render will automatically build and deploy your application

### Step 3: Verify Deployment

1. Once the deployment is complete, click on the service name to view details
2. Check the logs to ensure the server started properly
3. Visit the provided URL to verify your API is running

## Environment Variables

The following environment variables are configured in the Render deployment:

- `PORT` - Port on which the server listens (set to 10000 by default)
- `NODE_ENV` - Set to 'production' for deployment
- `GITHUB_WEBHOOK_SECRET` - Secret for validating GitHub webhook requests
- `SUPABASE_URL` - URL for your Supabase instance
- `OPENAI_API_KEY` - API key for OpenAI services
- `DATABASE_URL` - Connection string for your PostgreSQL database

## Database Migration

Before deploying, ensure your database schema is up to date by running:

```bash
npx prisma migrate deploy
```

This command will apply any pending migrations to your production database.

## Troubleshooting

If you encounter issues during deployment:

1. Check the build logs for any errors
2. Ensure all required environment variables are set correctly
3. Verify your database connection string is correct and accessible from Render
4. Check that your Prisma schema matches the state of your database
