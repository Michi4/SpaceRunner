FROM php:8.3-fpm-alpine

RUN docker-php-ext-install mysqli pdo_mysql
