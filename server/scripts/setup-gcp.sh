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

# Authentication options
echo "Choose authentication method:"
echo "1. Interactive login (default)"
echo "2. Service Account Key (less secure but simpler for CI/CD)"
read -p "Enter choice (1 or 2): " AUTH_CHOICE

if [ "$AUTH_CHOICE" = "2" ]; then
    echo "🔐 Service Account Key Authentication"
    read -p "Enter path to service account key file: " KEY_FILE
    if [ ! -f "$KEY_FILE" ]; then
        echo "❌ Key file not found: $KEY_FILE"
        exit 1
    fi
    gcloud auth activate-service-account --key-file="$KEY_FILE"
    echo "✅ Authenticated with service account key"
else
    # Default to interactive login
    echo "🔐 Interactive Authentication"
    gcloud auth login
fi

# Get project ID from user
read -p "Enter your Google Cloud Project ID: " PROJECT_ID

# Set the project
echo "📦 Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required services
echo "⚙️  Enabling required services..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    secretmanager.googleapis.com

echo "✅ GCP setup completed successfully!"
echo "Next steps:"
echo "1. Update your .env.production file with your configuration"
echo "2. Build and deploy your application"