FROM node

# Build react project
COPY . .
RUN ./build-npm-dev.sh

CMD ["npm", "start", "--prefix", "../frontend"]
