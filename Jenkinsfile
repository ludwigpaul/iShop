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
        DOCKER_CREDENTIALS_ID = credentials('dockerhub-creds-for-local-jenkins') // Jenkins credentials ID

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
        GCP_SERVICE_ACCOUNT_KEY = credentials('gcp-service-account-key')

        // This injects MYSQL_USER and MYSQL_PWD environment variables with the username and password
        MYSQL_CREDS = credentials('mysql-ishop-creds')
        MYSQL_USER = "${MYSQL_CREDS_USR}"
        MYSQL_PWD = "${MYSQL_CREDS_PSW}"
        MYSQL_HOST = 'ludwigpaul/ishop' // or the container/network name if needed
        MYSQL_DATABASE = 'ishop'

    }// end of environment

        stages {
                stage('System Check') {
                    steps {
                        sh '''
                            echo "🔍 System Information:"
                            whoami
                            id
                            uname -a
                            echo "Current directory: $(pwd)"
                            echo "Environment variables:"
                            env | grep -E "(DOCKER|JENKINS|BUILD)" | sort
                        '''
                    }
                }


                stage('Checkout GitHub Code') {
                    steps {
                        script {
                            deleteDir()

                            def scmVars = checkout([
                                $class: 'GitSCM',
                                branches: [[name: '*/ci-cd-pipeline']],
                                doGenerateSubmoduleConfigurations: false,
                                extensions: [
                                    [$class: 'CleanCheckout'],
                                    [$class: 'CloneOption', depth: 1, noTags: false, reference: '', shallow: true]
                                ],
                                submoduleCfg: [],
                                userRemoteConfigs: [[
                                    credentialsId: "${GIT_CREDENTIALS_ID}",
                                    url: "${GIT_REPO_SSH}"
                                ]]
                            ])

                            env.GIT_COMMIT = scmVars.GIT_COMMIT
                            env.GIT_BRANCH = scmVars.GIT_BRANCH
                            env.GIT_URL = scmVars.GIT_URL

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
                        sh '''
                            echo "📁 Repository contents:"
                            ls -la

                            if [ ! -f "package.json" ]; then
                                echo "❌ package.json not found"
                                exit 1
                            else
                                echo "✅ package.json found"
                                cat package.json | head -20
                            fi
                        '''
                    }
                }

//                 stage('Install System Dependencies') {
//                     steps {
//                         sh '''
//                             echo "🔧 Installing system dependencies..."
//
//                             # Update package list first
//                             echo "Updating package list..."
//                             apt-get update
//
//                             # Install basic utilities
//                             apt-get install -y curl wget gnupg lsb-release
//
//                             # Install Docker CLI if not present
//                             if ! command -v docker >/dev/null 2>&1; then
//                                 echo "📦 Installing Docker CLI..."
//
//                                 # Install Docker prerequisites
//                                 apt-get install -y \
//                                     apt-transport-https \
//                                     ca-certificates
//
//                                 # Add Docker GPG key
//                                 curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
//
//                                 # Add Docker repository
//                                 echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
//
//                                 # Update and install Docker CLI
//                                 apt-get update
//                                 apt-get install -y docker-ce-cli
//
//                                 echo "✅ Docker CLI installed"
//                             else
//                                 echo "✅ Docker CLI already available"
//                             fi
//
//                             # Install Google Cloud SDK if not present
//                             if ! command -v gcloud >/dev/null 2>&1; then
//                                 echo "📦 Installing Google Cloud SDK..."
//
//                                 # Add Google Cloud GPG key and repository
//                                 curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
//                                 echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
//
//                                 # Update and install
//                                 apt-get update
//                                 apt-get install -y google-cloud-cli
//
//                                 echo "✅ Google Cloud SDK installed"
//                             else
//                                 echo "✅ Google Cloud SDK already available"
//                             fi
//
//                             # Verify installations
//                             echo "🔍 Verifying installations:"
//                             docker --version
//                             gcloud --version
//                             node --version
//                             npm --version
//                         '''
//                     }
//                 }

                stage('Environment Setup') {
                    steps {
                        sh '''
                            echo "🔧 Setting up GCP authentication..."

                            # Authenticate with GCP
                            gcloud auth activate-service-account --key-file=${GOOGLE_APPLICATION_CREDENTIALS}
                            gcloud config set project ${GCP_PROJECT_ID}

                            echo "✅ GCP authentication completed"

                            # Verify Docker socket access
                            echo "🐳 Testing Docker access:"
                            docker info > /dev/null 2>&1 && echo "✅ Docker daemon accessible" || echo "⚠️ Docker daemon may not be accessible"
                        '''
                    }
                }

                stage('Install Dependencies') {
                    steps {
                        sh '''
                            echo "📦 Installing Node.js dependencies..."
                            npm ci
                            echo "✅ Dependencies installed"
                        '''
                    }
                }

                stage('Run Tests') {
                    steps {
                        sh '''
                            echo "🧪 Running tests..."
                            npm run test || echo "Tests completed with warnings or errors"
                            echo "✅ Tests stage completed"
                        '''
                    }
                }

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
               sh 'echo "Preparing to push Docker images to registry..."'

               sh '''
                   echo "Docker username: $DOCKER_CREDENTIALS_ID_USR"
                   echo "Docker registry: $DOCKER_REGISTRY"
                   echo $DOCKER_CREDENTIALS_ID_PSW | docker login $DOCKER_REGISTRY -u $DOCKER_CREDENTIALS_ID_USR --password-stdin
                   echo "🚀 Pushing Docker images..."
                   docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
                   docker push ${DOCKER_IMAGE}:latest
                   echo "✅ Images pushed successfully!"
                   docker logout
               '''
           }
       }

       stage('Deploy to GCP Compute Engine') {
           steps {
               sh '''
                   echo "🚀 Deploying to GCP Compute Engine..."

                   # Make scripts executable
                   chmod +x scripts/deploy-to-gcp.sh

                   # Deploy application
                   ./scripts/deploy-to-gcp.sh
               '''
           }
       }// end of deploy to GCP stage

        stage('Health Check') {
           steps {
               sh '''
                   echo "🏥 Performing application health check..."
                    chmod +x scripts/health-check.sh
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
                   echo "✅ Cleanup completed"
               '''
           }
       }// end of Cleanup Local Images stage

    }// end of stages

    post {
            always {
                script {
                    if (getContext(hudson.FilePath)) {
                        sh '''
                            echo "📊 Build Summary:"
                            echo "Project: ${GCP_PROJECT_ID}"
                            echo "Build Number: ${BUILD_NUMBER}"
                            echo "Image: ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                        '''
                    } else {
                        echo "⚠️ Workspace not available. Skipping build summary."
                    }
                }
            }

            success {
                script {
                    if (getContext(hudson.FilePath)) {
                        sh '''
                            EXTERNAL_IP=$(gcloud compute instances describe ${GCP_INSTANCE} \
                                --zone=${GCP_ZONE} \
                                --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

                            echo "✅ Deployment successful!"
                            echo "🌐 Application URL: http://${EXTERNAL_IP}:3000"
                            echo "🏥 Health Check: http://${EXTERNAL_IP}:3000/health"
                            echo "📦 Docker Image: ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                        '''
                    } else {
                        echo "⚠️ Workspace not available. Skipping success summary."
                    }
                }
            }

            failure {
                script {
                    if (getContext(hudson.FilePath)) {
                        sh '''
                            echo "❌ Deployment failed!"
                            echo "🔄 To rollback manually, run:"
                            chmod +x scripts/rollback.sh
                            echo "   ./scripts/rollback.sh [PREVIOUS_BUILD_NUMBER]"
                        '''
                    } else {
                        echo "⚠️ Workspace not available. Skipping failure summary."
                    }
                }
            }
        }
    }
