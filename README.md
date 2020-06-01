# Welcome to the DOIT Platform (formerly Startiq) Version 1.0 Monorepo

## Introduction

This repository contains the codebase needed to run the entire Startiq slack bot. The project is now called DOIT - Duke Open Innovation Stack. DOIT is a data-backed conversational AI platform that helps early stage founders understand how to generate and validate ideas. It uses big data to validate startup ideas and generates a report about the potential fundability and other aspects of a startup idea. The AI is currently implemented as a slackbot but can potentially be also used as web or desktop bot. 

## Setup instructions
1. Run `npm install` in all the node services repos (repos which contain package.json)
2. Create python virtual environment named `pyenv` in the root , using command `python3 -m venv pyenv`.
3. Activate the virtual environment using `source /pyenv/bin/activate`. 
4. Install python dependencies as listed in requirements.txt of idea-classifer-service and python-utils folder using 
the command `pip install -r requirements.txt` 
3. Make sure that `mongodb` and `nats-server` are running on their default ports.
3. Copy all the env files into `launcher/envs` folder 

## Launch instructions
1. Go to `/launcher` and execute `./launcher.sh`
You might need to make `launcher.sh` executable. For that use the command `chmod +x launcher.sh` . 
