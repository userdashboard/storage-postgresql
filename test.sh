if [ ! -d instance ]; then
    git clone https://github.com/userdashboard/dashboard.git instance
    cd instance
    npm install pg mocha puppeteer@2.1.1 --no-save
else 
    cd instance
fi
rm -rf node_modules/@userdashboard/storage-postgresql
mkdir -p node_modules/@userdashboard/storage-postgresql
cp ../index.js node_modules/@userdashboard/storage-postgresql
cp ../setup.sql node_modules/@userdashboard/storage-postgresql
cp -R ../src node_modules/@userdashboard/storage-postgresql

NODE_ENV=testing \
FAST_START=true \
DASHBOARD_SERVER=http://localhost:9000 \
DOMAIN=localhost \
STORAGE_ENGINE=@userdashboard/storage-postgresql \
DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres" \
GENERATE_SITEMAP_TXT=false \
GENERATE_API_TXT=false \
npm test