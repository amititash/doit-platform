#!/bin/bash

#For this launcher to work, copy the envs directory consisting of all env variable files , into the launcher/ folder. 
cp envs/notification-service.env ../notification-service/.env
cp envs/backend-service.env ../backend-service/.env
cp envs/bot-logger-service.env ../bot-logger-service/.env
cp envs/report-service.env ../report-service/.env
cp envs/slackbot-service.env ../slackbot-service/.env
cp envs/ab-testing-service.env ../ab-testing-service/.env
cp envs/bot-logs-analysis-backend.env ../bot-logs-analysis-backend/.env
cd ../notification-service
pm2 start ecosystem.config.js
cd ../backend-service
pm2 start ecosystem.config.js
cd ../bot-logger-service
pm2 start ecosystem.config.js
cd ../report-service
pm2 start ecosystem.config.js
cd ../slackbot-service
pm2 start ecosystem.config.js
cd ../ab-testing-service
pm2 start ecosystem.config.js
cd ../bot-logs-analysis-backend
pm2 start ecosystem.config.js
cd ..
source pyenv/bin/activate
cd python-utils
pm2 start ecosystem.config.js
cd ../idea-classifier-service
pm2 start ecosystem.config.js
deactivate
cd ..
cd startIQ-frontend
yarn start



