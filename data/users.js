const bcrypt = require('bcrypt');

module.exports = [
    {
        userType: '0',
        userName: 'Admin-1',
        phoneNumber: '123456789',
        email: process.env.ADMIN_EMAIL,
        password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        userType: '1',
        userName: 'User-1',
        phoneNumber: '987654321',
        email: 'user1@mail.com',
        password: bcrypt.hashSync('user1111', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        userType: '1',
        userName: 'User-2',
        phoneNumber: '346534534',
        email: 'user2@mail.com',
        password: bcrypt.hashSync('user2222', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        userType: '1',
        userName: 'User-3',
        phoneNumber: '563573856',
        email: 'user3@mail.com',
        password: bcrypt.hashSync('user3333', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
]