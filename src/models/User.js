const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const bcrypt = require('bcrypt');

class User extends Model {
  /**
   * Check if provided password matches the user's password
   * @param {string} password - Plain text password to check
   * @returns {Promise<boolean>} True if password matches
   */
  async checkPassword(password) {
    return bcrypt.compare(password, this.password);
  }

  /**
   * Get user data without sensitive information
   * @returns {object} User object without password
   */
  toPublicJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

// Initialize the model
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Email must be a valid email address',
        },
        notEmpty: {
          msg: 'Email is required',
        },
      },
      comment: 'User email address (unique)',
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password is required',
        },
        len: {
          args: [6, 255],
          msg: 'Password must be between 6 and 255 characters',
        },
      },
      comment: 'Hashed password',
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: 'First name must be less than 255 characters',
        },
      },
      comment: 'User first name',
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: 'Last name must be less than 255 characters',
        },
      },
      comment: 'User last name',
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 50],
          msg: 'Phone must be less than 50 characters',
        },
      },
      comment: 'User phone number',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      // Hash password before creating user
      beforeCreate: async (user) => {
        if (user.password) {
          const saltRounds = 10;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
      // Hash password before updating if it changed
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const saltRounds = 10;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
    },
    indexes: [
      {
        name: 'idx_users_email',
        fields: ['email'],
        unique: true,
      },
    ],
  }
);

module.exports = User;

