pipeline {
    agent any
    stages {
        stage('compile') {
            agent {
                        docker {
                            image 'node:lts-buster-slim'
                            args '-p 3000:3000'
                        }
                    }
            steps {
                sh 'npm i'
            }
        }
        stage('build') {
            agent {
                        docker {
                            image 'node:lts-buster-slim'
                            args '-p 3000:3000'
                        }
                    }
            steps {
                sh 'npm run build'
            }
        }
        stage('deploy') {
            steps {
                sh 'docker build -t humandao/bonus .'
            }
        }
    }
}