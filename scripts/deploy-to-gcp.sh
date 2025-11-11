#!/bin/bash

set -e

# Configuration
PROJECT_ID="calvary-revival-ministries"
ZONE="us-central1-c"
INSTANCE_NAME="instance-20250801-145732"
DOCKER_IMAGE="ludwigpaul/ishop"
CONTAINER_NAME="ishop-app"
BUILD_NUMBER=${BUILD_NUMBER:-"latest"}

echo "🚀 Starting deployment to GCP Compute Engine..."

# Authenticate with GCP
echo "🔐 Authenticating with GCP..."
gcloud auth activate-service-account --key-file=${GOOGLE_APPLICATION_CREDENTIALS}
gcloud config set project ${PROJECT_ID}

echo "📦 Deploying application to Compute Engine instance..."

# Ensure firewall rule for SSH exists
if ! gcloud compute firewall-rules list --filter='name=allow-ssh' --format='value(name)' | grep -q 'allow-ssh'; then
  echo "🔒 Creating firewall rule to allow SSH (tcp:22)..."
  gcloud compute firewall-rules create allow-ssh \
    --allow tcp:22 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=ssh-access \
    --description="Allow SSH access"
fi

# Add ssh-access tag to the instance
echo "🏷️  Adding 'ssh-access' tag to the instance..."
gcloud compute instances add-tags ${INSTANCE_NAME} \
  --zone=${ZONE} \
  --tags=ssh-access

# Deploy to Compute Engine
gcloud compute ssh sa_105782201469785741507@${INSTANCE_NAME} \
    --zone=${ZONE} \
    --command="
        set -e

        echo 'Stopping existing container...'
        sudo docker stop ${CONTAINER_NAME} 2>/dev/null || true
        sudo docker rm ${CONTAINER_NAME} 2>/dev/null || true

        echo 'Pulling latest image from Docker Hub...'
        sudo docker pull ${DOCKER_IMAGE}:${BUILD_NUMBER}

        echo 'Starting new container...'
        sudo docker run -d \
            --name ${CONTAINER_NAME} \
            --restart unless-stopped \
            -p 3000:3000 \
            -e NODE_ENV=production \
            -e PORT=3000 \
            --health-cmd='curl -f http://localhost:3000/health || node healthcheck.js || exit 1' \
            --health-interval=30s \
            --health-timeout=3s \
            --health-retries=3 \
            --health-start-period=40s \
            ${DOCKER_IMAGE}:${BUILD_NUMBER}

        echo 'Waiting for container to start...'
        sleep 10

        echo 'Verifying container status...'
        sudo docker ps | grep ${CONTAINER_NAME} || echo 'Container not running'

        echo 'Checking container logs...'
        sudo docker logs ${CONTAINER_NAME} --tail=20

        echo 'Cleaning up old images...'
        sudo docker image prune -af --filter 'until=24h'
    "

echo "✅ Deployment completed successfully!"

# Get instance external IP
EXTERNAL_IP=$(gcloud compute instances describe ${INSTANCE_NAME} \
    --zone=${ZONE} \
    --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo "🌐 Application is available at: http://${EXTERNAL_IP}:3000"