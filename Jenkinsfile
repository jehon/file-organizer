pipeline {
  agent any
  environment {
    CRYPTOMEDIC_UPLOAD_USER = credentials('CRYPTOMEDIC_UPLOAD_USER')
    CRYPTOMEDIC_UPLOAD_PASSWORD = credentials('CRYPTOMEDIC_UPLOAD_PASSWORD')
    CRYPTOMEDIC_DB_UPGRADE = credentials('CRYPTOMEDIC_DB_UPGRADE')
    // Need a port for console call -> do everything from dev is ok
    CRYPTOMEDIC_PORT = 15080
  }
  options {
    ansiColor('xterm')
    lock resource: 'port_${CRYPTOMEDIC_PORT}'
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