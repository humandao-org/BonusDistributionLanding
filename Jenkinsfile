pipeline {
    agent any
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