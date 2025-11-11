#!/bin/bash

set -e

PROJECT_ID="calvary-revival-ministries"
ZONE="us-central1-c"
INSTANCE_NAME="instance-20250801-145732"
DOCKER_IMAGE="ludwigpaul/ishop"
CONTAINER_NAME="ishop-app"
ROLLBACK_TAG=${1:-"latest"}

echo "🔄 Rolling back to version: ${ROLLBACK_TAG}"

# Authenticate with GCP
gcloud auth activate-service-account --key-file=${GOOGLE_APPLICATION_CREDENTIALS}
gcloud config set project ${PROJECT_ID}

echo "🔄 Performing rollback on GCP Compute Engine..."

gcloud compute ssh ${INSTANCE_NAME} \
    --zone=${ZONE} \
    --command="
        set -e

        echo 'Stopping current container...'
        sudo docker stop ${CONTAINER_NAME} || true
        sudo docker rm ${CONTAINER_NAME} || true

        echo 'Pulling rollback image...'
        sudo docker pull ${DOCKER_IMAGE}:${ROLLBACK_TAG}

        echo 'Starting rollback container...'
        sudo docker run -d \
            --name ${CONTAINER_NAME} \
            --restart unless-stopped \
            -p 3000:3000 \
            -e NODE_ENV=production \
            -e PORT=3000 \
            ${DOCKER_IMAGE}:${ROLLBACK_TAG}

        echo 'Verifying rollback...'
        sleep 10
        sudo docker ps | grep ${CONTAINER_NAME}
    "

# Get external IP and test
EXTERNAL_IP=$(gcloud compute instances describe ${INSTANCE_NAME} \
    --zone=${ZONE} \
    --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo "✅ Rollback to ${ROLLBACK_TAG} completed!"
echo "🌐 Application available at: http://${EXTERNAL_IP}:3000"