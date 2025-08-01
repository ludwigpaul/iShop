# Multi-stage build for cleaner installation
FROM node:18-slim as node-stage
# This stage just validates Node.js installation


FROM jenkins/jenkins:lts

# Switch to root user to install dependencies
USER root

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=18.19.0
ENV DOCKER_VERSION=24.0.7
ENV GCLOUD_VERSION=latest

ENV JENKINS_USER=admin
ENV JENKINS_PASS=admin123


# Install bash and other essential tools first
RUN apt-get update && apt-get install -y \
    bash \
    curl \
    wget \
    gnupg \
    lsb-release \
    apt-transport-https \
    ca-certificates \
    git \
    unzip \
    sudo \
    netcat-traditional \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*




# Install Docker CLI
RUN curl -fsSL https://get.docker.com | sh


# Install Google Cloud SDK
RUN curl https://sdk.cloud.google.com | bash && \
    mv /root/google-cloud-sdk /opt/google-cloud-sdk


# Preserve Jenkins' PATH and add our tools
ENV PATH="/usr/local/bin:/opt/google-cloud-sdk/bin:$PATH"

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Create directories
RUN mkdir -p /var/jenkins_home/scripts /var/jenkins_home/logs && \
    chown -R jenkins:jenkins /var/jenkins_home

# Disable setup wizard
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"

# Verification - but don't fail build if something is missing
RUN echo "=== Tool Verification ===" && \
    echo "PATH: $PATH" && \
    echo "JAVA_HOME: ${JAVA_HOME:-not set}" && \
    (java -version || echo "Java: not found in PATH") && \
    (node --version || echo "Node.js: not found") && \
    (npm --version || echo "npm: not found") && \
    (docker --version || echo "Docker: not found") && \
    (gcloud --version | head -1 || echo "gcloud: not found") && \
    (git --version || echo "git: not found") && \
    echo "=== Verification Complete ==="


# Create admin user automatically
COPY --chown=root:root init.groovy.d/ /usr/share/jenkins/ref/init.groovy.d/


# Copy any custom Jenkins configuration (optional)
# COPY jenkins.yaml /var/jenkins_home/casc_configs/jenkins.yaml

USER root

# Expose Jenkins ports
EXPOSE 8080 50000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/login || exit 1