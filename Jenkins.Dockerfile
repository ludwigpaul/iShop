FROM jenkins/jenkins:lts

# Switch to root user to install dependencies
USER root

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=18
ENV DOCKER_VERSION=24.0.7
ENV GCLOUD_VERSION=latest

ENV JENKINS_USER=admin
ENV JENKINS_PASS=admin123


# Update package list and install basic utilities
RUN apt-get update && apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    wget \
    gnupg \
    lsb-release \
    software-properties-common \
    build-essential \
    git \
    unzip \
    sudo \
    vim \
    jq \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" > /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y nodejs && \
    npm install -g npm@latest


# Install Docker CLI
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce-cli docker-compose-plugin

# Install Google Cloud SDK
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && \
    apt-get update && \
    apt-get install -y google-cloud-cli


# Install additional GCP components
RUN gcloud components install \
    kubectl \
    docker-credential-gcr \
    --quiet

# Install Jenkins plugins
RUN jenkins-plugin-cli --plugins \
    ant:475.vf34069fef73c \
    antisamy-markup-formatter:159.v25b_c67cd35fb_ \
    build-timeout:1.31 \
    credentials-binding:681.vf91669a_32e45 \
    email-ext:691.v31b_f06e5e554 \
    git:5.4.1 \
    github-branch-source:1807.v50351eb_7dd13 \
    gradle:2.12 \
    ldap:697.v8e8bf2db_25c8 \
    mailer:472.vf7c289a_4b_420 \
    matrix-auth:3.2.2 \
    pam-auth:1.11 \
    pipeline-github-lib:61.v629f2cc41d83 \
    pipeline-stage-view:2.34 \
    ssh-slaves:2.973.v0fa_8c0dea_f9f \
    timestamper:1.27 \
    workflow-aggregator:600.vb_57cdd26fdd7 \
    ws-cleanup:0.46 \
    docker-workflow:580.vc0c340686b_54 \
    docker-commons:439.va_3cb_0a_6a_fb_29 \
    docker-build-step:2.11 \
    pipeline-utility-steps:2.18.0 \
    credentials:1371.vfee6b_095f0a_3 \
    plain-credentials:183.va_de8f1dd5a_2b_ \
    ssh-credentials:337.v395d2403ccd4 \
    blueocean:1.27.14

# Create docker group and add jenkins user to it
RUN groupadd -f docker && usermod -aG docker jenkins

# Set proper permissions for Jenkins home
RUN chown -R jenkins:jenkins /var/jenkins_home

# Create directories for scripts and logs
RUN mkdir -p /var/jenkins_home/scripts /var/jenkins_home/logs && \
    chown -R jenkins:jenkins /var/jenkins_home/scripts /var/jenkins_home/logs

# Install additional useful tools
RUN apt-get update && apt-get install -y \
    tree \
    htop \
    nano \
    zip \
    unzip \
    rsync \
    && rm -rf /var/lib/apt/lists/*

# Verify installations
RUN echo "=== Verification ===" && \
    node --version && \
    npm --version && \
    docker --version && \
    gcloud --version && \
    kubectl version --client=true && \
    git --version && \
    java --version

# Set up environment variables for all users
RUN echo 'export PATH="/usr/local/bin:$PATH"' >> /etc/bash.bashrc && \
    echo 'export DOCKER_HOST=unix:///var/run/docker.sock' >> /etc/bash.bashrc

# Clean up
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Switch back to jenkins user
USER jenkins

# Set Jenkins environment variables
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false -Djava.awt.headless=true"
ENV JENKINS_OPTS="--httpPort=8080"

# Create admin user automatically
COPY --chown=jenkins:jenkins init.groovy.d/ /usr/share/jenkins/ref/init.groovy.d/


# Copy any custom Jenkins configuration (optional)
# COPY jenkins.yaml /var/jenkins_home/casc_configs/jenkins.yaml

# Expose Jenkins ports
EXPOSE 8080 50000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/login || exit 1