#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/dung-portfolio/current}"
cd "$APP_DIR"

php artisan down --retry=30 || true
composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader
npm install
npm run build
php artisan migrate --force
php artisan storage:link || true
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart
chown -R www-data:www-data storage bootstrap/cache
php artisan up
