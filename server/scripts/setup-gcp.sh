#!/bin/bash

# SprintSync GCP Setup Script
# This script sets up the Google Cloud Platform environment for SprintSync

set -e  # Exit on any error

echo "🔧 SprintSync GCP Setup"
echo "======================"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK not found. Please install it first."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Authenticate with Google Cloud
echo "🔐 Authenticating with Google Cloud..."
gcloud auth login

# Get project ID from user
read -p "Enter your Google Cloud Project ID: " PROJECT_ID

# Set the project
echo "📦 Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required services
echo "⚙️  Enabling required services..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com

echo "✅ GCP setup completed successfully!"
echo "Next steps:"
echo "1. Update your .env.production file with your configuration"
echo "2. Build and deploy your application"