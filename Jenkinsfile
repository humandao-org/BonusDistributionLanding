pipeline {
    agent {
        docker {
            image 'node:lts-buster-slim'
            args '-p 3000:3000'
        }
    }
    stages {
        stage('compile') {
            steps {
                sh 'npm i'
            }
        }
        stage('build') {
            steps {
                sh 'npm run build'
            }
        }
        stage('deploy') {
            agent any
            steps {
                sh 'docker build -t humandao/bonus .'
            }
        }
    }
}