'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Comments.init({
    comment: {
      type: DataTypes.STRING,
      validate: {
        isInRange(comment){
          if(!/^.{0,128}$/gm.test(comment)){
            throw new Error('comment is too long, maximum number of chars is 128.')
          }
          else if(comment === ""){
            throw new Error('Please provide a comment.')
          }
        }
      }
    },
    userId: DataTypes.STRING,
    imgId: DataTypes.STRING,
    userName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Comments',
  });
  return Comments;
};