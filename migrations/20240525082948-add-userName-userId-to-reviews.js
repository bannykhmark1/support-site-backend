module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('reviews', 'userName', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('reviews', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('reviews', 'userName');
    await queryInterface.removeColumn('reviews', 'userId');
  }
};