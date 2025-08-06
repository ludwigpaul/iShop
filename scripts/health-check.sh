#!/bin/bash

PROJECT_ID="calvary-revival-ministries"
ZONE="us-central1-c"
INSTANCE_NAME="instance-20250801-145732"
USERNAME="ludwigpaul48"

echo "🏥 Performing health check..."

# Get external IP
EXTERNAL_IP=$(gcloud compute instances describe ${INSTANCE_NAME} \
    --zone=${ZONE} \
    --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo "Instance IP: ${EXTERNAL_IP}"

# Wait for application to start
echo "⏳ Waiting for application to start..."
sleep 45

# Perform health check with retries
MAX_RETRIES=1
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "🔍 Health check attempt ${RETRY_COUNT}/${MAX_RETRIES}..."

    # Try health endpoint first, then root endpoint
    if curl -f -m 10 http://${EXTERNAL_IP}:3000/health 2>/dev/null; then
        echo "✅ Health check passed!"
        exit 0
    elif curl -f -m 10 http://${EXTERNAL_IP}:3000/ 2>/dev/null; then
        echo "✅ Application is responding!"
        exit 0
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "⏳ Health check failed. Retrying in 15 seconds..."
        sleep 15
    fi
done

echo "❌ Health check failed after ${MAX_RETRIES} attempts"

# Debug information
echo "🔍 Debug Information:"
gcloud compute ssh ${USERNAME}@${INSTANCE_NAME} --zone=${ZONE} --command="
    echo 'Container status:'
    sudo docker ps -a | grep ishop-app || echo 'No ishop-app container found'

    echo 'Container logs:'
    sudo docker logs ishop-app --tail=50 || echo 'No logs available'

    echo 'System resources:'
    free -h
    df -h
"

exit 1