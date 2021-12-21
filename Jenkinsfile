pipeline {
    agent none;
    stages {
        stage('Compile') {
          agent {
                docker {
                    image 'node:lts-buster-slim'
                    args '-p 3000:3000'
                }
            }
            steps {
                sh 'npm i'
                sh 'npm run build'
            }
        }
        stage('deploy') {
            agent any;
            steps {
                sh 'docker build -t humandao/bonus .'
            }
        }
    }
}