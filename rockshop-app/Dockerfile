# Use Node.js v18 on Alpine
FROM node:18-alpine

# 1. Set working directory
WORKDIR /app

# 2. Install OpenCV system libs + build tools
RUN apk add --no-cache --virtual .build-deps \
      build-base \
      cmake \
      git \
      python3-dev \
      pkgconfig \
      libjpeg-turbo-dev \
      libpng-dev \
      opencv-dev \
    && apk add --no-cache \
      python3 \
      libjpeg-turbo \
      libpng \
      opencv

# 3. Disable opencv4nodejs autobuild (use system OpenCV)
ENV OPENCV4NODEJS_DISABLE_AUTOBUILD=1

# 4. Install production JS deps
COPY package.json package-lock.json ./
RUN npm install --production

# 5. Remove build deps to slim image
RUN apk del .build-deps

# 6. Copy the rest of your app
COPY . .

# 7. Expose port and launch
EXPOSE 3000
CMD ["node", "server.js"]
