#!/bin/bash

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
source ~/.bashrc
nvm install 16.13.2

npm install pm2 -g
node -v
npm -v
pm2 --version
