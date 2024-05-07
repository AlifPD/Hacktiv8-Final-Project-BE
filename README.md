# Hacktiv8 Final Project BE Development

Backend for MedInventory-Hacktiv8 Final Project.

## Project Setup
First, Install the project dependencies
```sh
npm install
npm install --save-dev nodemon
npm install --save-dev sequelize-cli
```

## Env
Before running, create a `.env` file in the project, fill it with the projects Environment Configurations
```sh
NODE_ENV= ... //Environment (development, production, test)
APP_PORT= ... //Port for the node app (default is 4000)

//Database config for Development Environment
DB_USERNAME_DEV= ... //Database Username
DB_PASSWORD_DEV= ... //Database Password
DB_NAME_DEV= ... //Database Name
DB_HOST_DEV= ... //Database Host
DB_PORT_DEV= ... //Database Port

//Database config for Production Environment
DB_USERNAME_PROD= ... //Database Username
DB_PASSWORD_PROD= ... //Database Password
DB_NAME_PROD= ... //Database Name
DB_HOST_PROD= ... //Database Host
DB_PORT_PROD= ... //Database Port

//Database config for Testing Environment
DB_USERNAME_TEST= ... //Database Username
DB_PASSWORD_TEST= ... //Database Password
DB_NAME_TEST= ... //Database Name
DB_HOST_TEST= ... //Database Host
DB_PORT_TEST= ... //Database Port

//Key for Json Web Token
JWT_SECRET_KEY="..." //Secret Key
JWT_EXPIRES="30d" //Secret Key expiration

//Admin Email and Password
ADMIN_PASSWORD='...' //Password for Admin (length > 5)
ADMIN_EMAIL='...' //Email for Admin
```

## Database Migration and Seeding
To create new tables used in this project run the command below
```sh
npx sequelize db:migrate
```
This project also has a seeder for Admin account (make sure to fill the `.env` file)  and run the command below
```sh
npx sequelize db:seed:all
```
reference for sequelize migrations and seeding :
 https://sequelize.org/docs/v6/other-topics/migrations/#creating-the-first-seed

## Running the Project
For running in local machines, use command below,
```sh
npm run start:dev:local
```
For running in servers, use command below,
```sh
npm run start:dev
```