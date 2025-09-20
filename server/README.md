# SprintSync Backend

FastAPI backend server for SprintSync.

## Structure

```
server/
├── app/               # Application source code
│   ├── models/         # SQLAlchemy models
│   ├── schemas/        # Pydantic schemas
│   ├── auth/           # Authentication
│   ├── ai/             # AI integration
│   ├── core/          # Core configuration
│   ├── database/      # Database setup
│   ├── middleware/     # Custom middleware
│   ├── routers/        # API endpoints
│   └── main.py        # FastAPI app entry point
├── alembic/           # Database migrations
├── scripts/           # Deployment and setup scripts
├── requirements.txt   # Python dependencies
└── Dockerfile         # Docker configuration
```

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Environment Configuration

The project uses environment files for configuration. Copy the appropriate template:

For local development:
```bash
cp .env.local .env
```

For production deployment:
```bash
cp .env.production .env
```

Then edit the `.env` file with your specific configuration.

## Deployment

### Prerequisites

1. Google Cloud Platform account
2. Docker installed locally
3. Google Cloud SDK installed
4. Domain name (optional, for custom domain)

### Authentication Options

The deployment scripts support two authentication methods with Google Cloud:

1. **Interactive Authentication** (default): Requires manual login through a web browser
2. **Service Account Key Authentication** (Option 2): Uses a service account key file for authentication (less secure but simpler for CI/CD)

To use Service Account Key Authentication:
1. Create a service account in Google Cloud Console
2. Generate and download a JSON key file for the service account
3. When running `./scripts/setup-gcp.sh`, choose option 2 and provide the path to your key file

### Automated Deployment

The project includes scripts to automate the deployment process:

1. **Setup GCP Environment**:
   ```bash
   ./scripts/setup-gcp.sh
   ```

2. **Setup Cloud SQL Database**:
   ```bash
   ./scripts/setup-database.sh
   ```

3. **Deploy to Cloud Run**:
   ```bash
   ./scripts/gcp-deploy.sh
   ```

### Manual Deployment

#### 1. Enable required services:
```bash
gcloud services enable cloudbuild.googleapis.com run.googleapis.com sqladmin.googleapis.com
```

#### 2. Create Cloud SQL instance:
```bash
gcloud sql instances create sprintsync-db \
  --database-version=POSTGRES_13 \
  --region=us-central1 \
  --cpu=1 \
  --memory=3.75GB \
  --storage-type=SSD \
  --storage-size=10GB

gcloud sql databases create sprintsyncdb \
  --instance=sprintsync-db

gcloud sql users create sprintsync_user \
  --instance=sprintsync-db \
  --password=SECURE_PASSWORD
```

#### 3. Build and deploy to Cloud Run:
```bash
# Build the Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/sprintsync-backend .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/sprintsync-backend

# Deploy to Cloud Run
gcloud run deploy sprintsync-backend \
  --image gcr.io/YOUR_PROJECT_ID/sprintsync-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### 4. Configure environment variables:
```bash
gcloud run services update sprintsync-backend \
  --update-env-vars ENVIRONMENT=production,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,CLOUD_SQL_INSTANCE=sprintsync-db,CLOUD_SQL_DATABASE=sprintsyncdb,CLOUD_SQL_USERNAME=sprintsync_user,CLOUD_SQL_PASSWORD=YOUR_PASSWORD,SECRET_KEY=YOUR_SECRET_KEY \
  --region us-central1
```

### CI/CD with GitHub Actions

The repository includes a GitHub Actions workflow that automatically deploys to Cloud Run on pushes to the main branch. To use it:

1. Create a Google Cloud service account with the required permissions
2. Add the service account key as `GCP_SA_KEY` in GitHub Secrets
3. Add your Google Cloud Project ID as `GCP_PROJECT_ID` in GitHub Secrets

### Custom Domain Configuration

To use a custom domain:

1. Map the domain to your Cloud Run service:
   ```bash
   gcloud run domain-mappings create \
     --service sprintsync-backend \
     --domain yourdomain.com \
     --region us-central1
   ```

2. Update DNS records with your domain registrar as instructed
3. Update environment variables to include your custom domain in ALLOWED_ORIGINS

SSL certificates are automatically provisioned and managed by Google Cloud Run.