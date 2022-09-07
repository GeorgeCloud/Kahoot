
# STEP 1: Install base image
FROM node:16

# STEP 2: cp source code to current container & store it: /app
ADD . /app

# STEP 3: Set working directory to /app
WORKDIR /app

# STEP 4: Install dependencies
RUN npm install

# STEP 5: Declare environment variables

# STEP 6: Expose running port
EXPOSE 3000

# STEP 7: Run server/service
CMD ["node", "index.js"]
