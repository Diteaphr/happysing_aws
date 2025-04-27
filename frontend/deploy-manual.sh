#!/bin/bash

# Exit on error
set -e

echo "Starting manual GitHub Pages deployment..."

# Define variables
REPO_URL=$(git config --get remote.origin.url)
BUILD_DIR="build"
TEMP_DIR="temp_deploy"
BRANCH="gh-pages"

# Create a temporary directory for deployment
rm -rf $TEMP_DIR
mkdir $TEMP_DIR

# Copy build files to the temporary directory
echo "Copying build files..."
cp -r $BUILD_DIR/* $TEMP_DIR/
# Make sure .nojekyll exists
touch $TEMP_DIR/.nojekyll

# Initialize git in the temporary directory
cd $TEMP_DIR
git init
git checkout -b $BRANCH

# Configure git
git config user.name "GitHub Pages Deployment"
git config user.email "deployment@example.com"

# Add files in smaller batches to avoid E2BIG error
echo "Adding files to git in batches..."
find . -type f | sort | split -l 100 - batch_
for batch in batch_*; do
    echo "Processing batch $batch"
    xargs -n1 git add < $batch
    rm $batch
done

# If there are no changes, we can exit early
if git status | grep -q "nothing to commit"; then
    echo "No changes to commit"
    exit 0
fi

# Commit
echo "Committing changes..."
git commit -m "Deploy to GitHub Pages"

# Push to GitHub with force option and limited history
echo "Pushing to GitHub..."
git remote add origin $REPO_URL
git push --force origin $BRANCH

# Clean up
cd ..
rm -rf $TEMP_DIR

echo "Deployment completed successfully!"
