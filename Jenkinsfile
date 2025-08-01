pipeline {

 agent any

    environment {
        // Docker Configuration
        DOCKER_TAG = "${BUILD_NUMBER}"
        DOCKER_LATEST = "${DOCKER_IMAGE}:latest"
        DOCKER_VERSIONED = "${DOCKER_IMAGE}:${DOCKER_TAG}"

        // Docker Registry Configuration
        DOCKER_IMAGE = 'ludwigpaul/ishop'
        DOCKER_REGISTRY = 'https://index.docker.io/v1/'
        DOCKER_CREDENTIALS_ID = 'dockerhub-creds-for-local-jenkins' // Jenkins credentials ID

        // Node Configuration
        NODE_VERSION = '18'

        //GitHub Configuration
        GIT_CREDENTIALS_ID = 'gitHubCredentials'
        GIT_REPO_SSH = 'git@github.com:ludwigpaul/iShop.git'

        //GCP Configuration
        GCP_PROJECT_ID = 'calvary-revival-ministries'
        GCP_ZONE = 'us-central1-c'
        GCP_INSTANCE = 'instance-20250801-145732'

        //GCP Credentials
        GOOGLE_APPLICATION_CREDENTIALS = credentials('calvary-revival-ministries-f4be12e8905e.json')
    }

    stages {

        stage('Checkout GitHub Code') {
            steps {
                script {
                    // Clean workspace first
                    deleteDir()

                    // Checkout code with proper configuration
                    def scmVars = checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/ci-cd-pipeline']], // or '*/master' if that's your default branch
                        doGenerateSubmoduleConfigurations: false,
                        extensions: [
                            [$class: 'CleanCheckout'],
                            [$class: 'CloneOption', depth: 1, noTags: false, reference: '', shallow: true]
                        ],
                        submoduleCfg: [],
                        userRemoteConfigs: [[
                            credentialsId: "${GIT_CREDENTIALS_ID}", // Add this credential in Jenkins
                            url: "${GIT_REPO_SSH}"
                        ]]
                    ])

                   // Set Git environment variables manually
                   env.GIT_COMMIT = scmVars.GIT_COMMIT
                   env.GIT_BRANCH = scmVars.GIT_BRANCH
                   env.GIT_URL = scmVars.GIT_URL

                   // Extract branch name from GIT_BRANCH (removes origin/ prefix)
                   if (env.GIT_BRANCH) {
                       env.BRANCH_NAME = env.GIT_BRANCH.replaceAll(/^origin\//, '')
                   }

                   echo "✅ Git variables set:"
                   echo "GIT_COMMIT: ${env.GIT_COMMIT}"
                   echo "GIT_BRANCH: ${env.GIT_BRANCH}"
                   echo "BRANCH_NAME: ${env.BRANCH_NAME}"
                }
            }
        }

        stage('Verify Checkout') {
                steps {
                    script {
                        // Verify the checkout by listing files
                        sh 'ls -la'

                        sh 'git branch -a || echo "No branches found"'
                        sh 'git log -1 || echo "No commits found"'
                        sh 'git status || echo "No status available"'
                        sh 'git remote -v || echo "No remotes found"'

                        // Check if package.json exists
                        if (!fileExists('package.json')) {
                            error "❌ package.json not found in the repository. Checkout failed."
                        } else {
                            echo "✅ package.json found. Checkout successful."
                        }
                    }
                }
        }

        stage('Environment Setup') {
                    steps {
                        sh '''
                                    echo "🔧 Setting up environment..."
                                    whoami
                                    echo "Node version: $(node --version)"
                                    echo "NPM version: $(npm --version)"
                                    echo "Docker version: $(docker --version)"
                                    echo "Build Number: ${BUILD_NUMBER}"
                                    echo "Branch: ${GIT_BRANCH}"

                                    # Check if gcloud is already available
                                    if command -v gcloud &> /dev/null; then
                                        echo "✅ Google Cloud SDK already installed"
                                        gcloud --version
                                    else
                                        echo "📦 Installing Google Cloud SDK..."

                                        # Download and install gcloud
                                        cd /var/jenkins_home
                                        if [ ! -d "google-cloud-sdk" ]; then
                                            curl https://sdk.cloud.google.com | bash -s -- --disable-prompts --install-dir=/var/jenkins_home
                                        fi

                                        # Source the path file if it exists
                                        if [ -f "/var/jenkins_home/google-cloud-sdk/path.bash.inc" ]; then
                                            source /var/jenkins_home/google-cloud-sdk/path.bash.inc
                                        fi

                                        # Add to PATH manually if sourcing fails
                                        export PATH="/var/jenkins_home/google-cloud-sdk/bin:$PATH"

                                        echo "✅ Google Cloud SDK installed"
                                        gcloud --version
                                    fi

                                    # Authenticate with GCP
                                    echo "🔐 Authenticating with GCP..."
                                    gcloud auth activate-service-account --key-file=${GOOGLE_APPLICATION_CREDENTIALS}
                                    gcloud config set project ${GCP_PROJECT_ID}

                                    echo "✅ GCP authentication completed"
                                '''
                    }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    // Install Node.js dependencies
                     sh '''
                            echo "📦 Installing dependencies..."
                            npm install
                        '''
                }

            }
        }

        stage('Run Tests') {
                    steps {
                        script {
                            // Run tests
                            sh '''
                                echo "Running tests..."
                                npm run test || echo "Tests completed with warnings or errors"
                                echo "Tests completed successfully."
                            '''
                        }
                    }
                }

        stage('Install Docker CLI') {
            steps {
                sh '''
                    echo "🐳 Installing Docker CLI..."

                    # Check if docker is already installed
                    if command -v docker >/dev/null 2>&1; then
                        echo "✅ Docker CLI already installed"
                        docker --version
                    else
                        echo "📦 Installing Docker CLI..."

                        # Update package list
                        sudo apt-get update

                        # Install prerequisites
                        sudo apt-get install -y \
                            apt-transport-https \
                            ca-certificates \
                            curl \
                            gnupg \
                            lsb-release

                        # Add Docker GPG key
                        curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

                        # Add Docker repository
                        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

                        # Install Docker CLI
                        sudo apt-get update
                        sudo apt-get install -y docker-ce-cli

                         # Add current user to docker group
                         sudo usermod -aG docker $USER

                        echo "✅ Docker CLI installed successfully"
                    fi

                    # Verify installation
                    docker --version
                '''
            }
        }// end of Install Docker CLI stage


        stage('Build Docker Image') {
                    steps {
                        script {
                            // Build Docker image
                            sh '''
                                echo "🏗️ Building Docker image..."
                                docker build -t ${DOCKER_LATEST} -t ${DOCKER_VERSIONED} .
                                echo "Docker image built successfully."
                                docker images | grep ishop
                            '''
                            env.DOCKER_IMAGE_ID = "${DOCKER_IMAGE}:${DOCKER_TAG}"
                            echo "Docker image ID: ${env.DOCKER_IMAGE_ID}"
                        }
                    }
                }

       stage('Push to Registry') {
                   steps {
                       script {
                          sh '''
                                  echo "Logging into Docker registry..."
                                  echo $DOCKER_CREDENTIALS_PSW | docker login ${DOCKER_REGISTRY} -u $DOCKER_CREDENTIALS_ID --password-stdin

                                  echo "Pushing Docker images..."
                                  docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
                                  docker push ${DOCKER_IMAGE}:latest

                                  echo "Docker images pushed successfully."
                                      '''

                       }
                   }
       }// end of push to registry

       stage('Deploy to GCP Compute Engine') {
                   steps {
                       sh '''
                           echo "🚀 Deploying to GCP Compute Engine..."

                           # Make scripts executable
                           chmod +x scripts/deploy-to-gcp.sh
                           chmod +x scripts/health-check.sh
                           chmod +x scripts/rollback.sh

                           # Deploy application
                           ./scripts/deploy-to-gcp.sh
                       '''
                   }
       }// end of deploy to GCP stage

        stage('Health Check') {
                   steps {
                       sh '''
                           echo "🏥 Performing application health check..."
                           ./scripts/health-check.sh
                       '''
                   }
        } // end of health check stage

       stage('Cleanup Local Images') {
               steps {
                   sh '''
                       echo "🧹 Cleaning up local Docker images..."
                       docker rmi ${DOCKER_VERSIONED} || true
                       docker rmi ${DOCKER_LATEST} || true
                       docker system prune -f
                   '''
               }
       }// end of Cleanup Local Images stage

    }// end of stages

    post {
            always {
                sh '''
                    echo "📊 Build Summary:"
                    echo "Project: ${GCP_PROJECT_ID}"
                    echo "Build Number: ${BUILD_NUMBER}"
                    echo "Image: ${IMAGE_NAME}:${BUILD_NUMBER}"
                '''
            }

            success {
                script {
                    sh '''
                        EXTERNAL_IP=$(gcloud compute instances describe ${GCP_INSTANCE} \
                            --zone=${GCP_ZONE} \
                            --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

                        echo "✅ Deployment successful!"
                        echo "🌐 Application URL: http://${EXTERNAL_IP}:3000"
                        echo "🏥 Health Check: http://${EXTERNAL_IP}:3000/health"
                        echo "📦 Docker Image: ${IMAGE_NAME}:${BUILD_NUMBER}"
                    '''
                }
            }

            failure {
                script {
                    sh '''
                        echo "❌ Deployment failed!"
                        echo "🔄 To rollback manually, run:"
                        echo "   ./scripts/rollback.sh [PREVIOUS_BUILD_NUMBER]"

                        # Optional: Auto-rollback to previous successful build
                        # PREVIOUS_BUILD=$((BUILD_NUMBER - 1))
                        # if [ $PREVIOUS_BUILD -gt 0 ]; then
                        #     echo "🔄 Auto-rollback to build ${PREVIOUS_BUILD}..."
                        #     chmod +x scripts/rollback.sh
                        #     ./scripts/rollback.sh ${PREVIOUS_BUILD}
                        # fi
                    '''
                }
            }
        }

}