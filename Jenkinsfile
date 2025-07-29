pipeline {

 agent any

    environment {
    DOCKER_IMAGE = 'ludwigpaul/ishop'
    DOCKER_TAG = "${BUILD_NUMBER}"
    DOCKER_LATEST = "${DOCKER_IMAGE}:latest"
    DOCKER_VERSIONED = "${DOCKER_IMAGE}:${DOCKER_TAG}"
    DOCKER_REGISTRY = 'https://index.docker.io/v1/'
    DOCKER_CREDENTIALS_ID = 'dockerhub-creds-for-local-jenkins' // Jenkins credentials ID
    NODE_VERSION = '18'
    GIT_CREDENTIALS_ID = 'gitHubCredentials'
    GIT_REPO_SSH = 'git@github.com:ludwigpaul/iShop.git'
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

                    stage('Environment Info') {
                                steps {
                                    sh '''
                                        whoami
                                        id
                                        echo "Node version: $(node --version)"
                                        echo "NPM version: $(npm --version)"
                                        echo "Docker version: $(docker --version)"
                                        echo "Build Number: ${BUILD_NUMBER}"
                                        echo "Branch: ${GIT_BRANCH}"
                                    '''
                                }
                    }

                    stage('Install Dependencies') {
                        steps {
                            script {
                                // Install Node.js dependencies
                                sh 'npm install'


                            }

                        }
                    }

    }


}