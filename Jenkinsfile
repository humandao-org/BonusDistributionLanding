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
                sh './mvnw clean compile'
            }
        }
        stage('Test') {
            steps {
                sh './mvnw test'
             }
         }
        stage('Package') {
             steps {
                 echo "-=- packaging project -=-"
                 sh "./mvnw package -DskipTests"
                 sh "./ci/package.sh"
             }
        }
    }
}