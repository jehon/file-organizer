pipeline {
  agent any
  options {
    ansiColor('xterm')
    skipStagesAfterUnstable()
    disableConcurrentBuilds()
  }
  stages {
    stage('setup') {
      steps {
        sh 'make setup-computer-test'
      }
    }
    stage('dump') {
      steps {
        sh 'make dump'
      }
    }
    stage('build') {
      steps {
        sh '''
set -e
npm ci
touch node_modules/.dependencies
make build
'''
      }
    }

    stage('test') {
      steps {
        sh 'make test'
      }
    }

    stage('lint') {
      steps {
        sh 'make lint'
      }
    }
  }
}