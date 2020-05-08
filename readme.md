# PostgreSQL Storage for Dashboard
![Test suite status](https://github.com/userdashboard/storage-postgresql/workflows/test-and-publish/badge.svg?branch=master)

Install this module to use [PostgreSQL](https://postgresql.org) for data storage.

You will need to launch with additional configuration variables:

  STORAGE=@userdashboard/storage-postgresql
  DATABASE_URL=postgres://localhost:5432/database

You can use this storage for a module:

    MODULE_NAME_STORAGE=@userdashboard/storage-postgresql
    MODULE_NAME_DATABASE_URL=postgres://localhost:5432/database

To test this module use [Dashboard](https://github.com/userdashboard/dashboard)'s test suite configured with this storage engine.

# Dashboard

Dashboard is a NodeJS project that provides a reusable account management system for web applications. 

Dashboard proxies your application server to create a single website where pages like signing in or changing your password are provided by Dashboard.  Your application server can be anything you want, and use Dashboard's API to access data as required.

Using modules you can expand Dashboard to include organizations, subscriptions powered by Stripe, or a Stripe Connect platform.

## Support and documentation

Join the freenode IRC #userdashboard chatroom for support.  [Web IRC client](https://kiwiirc.com/nextclient/)

- [Developer documentation home](https://userdashboard.github.io/home)
- [Administrator documentation home](https://userdashboard.github.io/administrators/home)
- [User documentation home](https://userdashboard.github.io/users/home)

#### Development

Development takes place on [Github](https://github.com/userdashboard/storage-postgresql) with releases on [NPM](https://www.npmjs.com/package/@userdashboard/storage-postgresql).

#### License

This software is distributed under the MIT license.
