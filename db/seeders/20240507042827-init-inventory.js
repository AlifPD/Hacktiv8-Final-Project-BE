'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('inventory', [
      {
        itemName: 'alat sterilisasi 1',
        quantity: 10,
        category: 'alat kesehatan',
        location: 'gedung 1',
        isAvailable: true,
        description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sapiente laborum voluptates iure modi esse eaque natus, commodi, eos velit quod eum ratione nesciunt! Debitis velit porro, voluptas nesciunt dolorem eveniet. Ipsa ex libero dignissimos similique perferendis illo nam omnis accusamus sed neque aut quasi maxime vel, ad, esse eos itaque.",
        pictureUrl: "https://picsum.photos/seed/picsum/200/300",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        itemName: 'tempat tidur pasien 1',
        quantity: 19,
        category: 'alat kesehatan',
        location: 'gedung 1',
        isAvailable: true,
        description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sapiente laborum voluptates iure modi esse eaque natus, commodi, eos velit quod eum ratione nesciunt! Debitis velit porro, voluptas nesciunt dolorem eveniet. Ipsa ex libero dignissimos similique perferendis illo nam omnis accusamus sed neque aut quasi maxime vel, ad, esse eos itaque.",
        pictureUrl: "https://picsum.photos/seed/picsum/200/300",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        itemName: 'lemari obat 1',
        quantity: 20,
        category: 'inventaris farmasi',
        location: 'gedung 2',
        isAvailable: true,
        description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sapiente laborum voluptates iure modi esse eaque natus, commodi, eos velit quod eum ratione nesciunt! Debitis velit porro, voluptas nesciunt dolorem eveniet. Ipsa ex libero dignissimos similique perferendis illo nam omnis accusamus sed neque aut quasi maxime vel, ad, esse eos itaque.",
        pictureUrl: "https://picsum.photos/seed/picsum/200/300",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        itemName: 'alat sterilisasi 2',
        quantity: 10,
        category: 'alat kesehatan',
        location: 'gedung 1',
        isAvailable: true,
        description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sapiente laborum voluptates iure modi esse eaque natus, commodi, eos velit quod eum ratione nesciunt! Debitis velit porro, voluptas nesciunt dolorem eveniet. Ipsa ex libero dignissimos similique perferendis illo nam omnis accusamus sed neque aut quasi maxime vel, ad, esse eos itaque.",
        pictureUrl: "https://picsum.photos/seed/picsum/200/300",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        itemName: 'stetoskop 1',
        quantity: 26,
        category: 'alat kesehatan',
        location: 'gedung 1',
        isAvailable: true,
        description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sapiente laborum voluptates iure modi esse eaque natus, commodi, eos velit quod eum ratione nesciunt! Debitis velit porro, voluptas nesciunt dolorem eveniet. Ipsa ex libero dignissimos similique perferendis illo nam omnis accusamus sed neque aut quasi maxime vel, ad, esse eos itaque.",
        pictureUrl: "https://picsum.photos/seed/picsum/200/300",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('inventory');
  }
};
