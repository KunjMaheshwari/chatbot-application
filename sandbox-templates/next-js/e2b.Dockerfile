# Use stable Node version
FROM node:20-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y curl git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /home/user

# Copy compile script
COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

# Create Next.js app
RUN npx --yes create-next-app@16.1.6 . \
    --yes \
    --ts \
    --tailwind \
    --eslint \
    --app \
    --src-dir \
    --import-alias "@/*"

# Initialize shadcn
RUN npx --yes shadcn@2.6.3 init --yes -b neutral --force
RUN npx --yes shadcn@2.6.3 add --all --yes

# Install dependencies
RUN npm install

# FIX: Install missing animation dependency
RUN npm install tw-animate-css

# Expose Next.js port
EXPOSE 3000

# Start dev server
CMD ["npm", "run", "dev"]