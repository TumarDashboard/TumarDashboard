import mongoose from 'mongoose'

export const MongooseSchema = new mongoose.Schema({
  surname: {
    type: String,
    required: [true, 'Пожалуйста, введите логин']
  },

  firstName: {
    type: String,
    required: [true, 'Пожалуйста, введите логин']
  },

  patronymic: {
    type: String
  },

  uiAvatarsSrc: {
    type: String
  },

  telephone:{
    type: [String]
  },

  iin:{
    type: String
  },

  manager:{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'managerSheme'
  },

  managerSheme:{
    type: String,
    default: 'User',
    enum: ['User', 'UserArchive']
  },

  guardPosts:{
    type:[mongoose.Schema.Types.ObjectId],
    ref: 'GuardPosts'
  }

}, { timestamps: true })

export default mongoose.models == null ? mongoose.model('Guards', MongooseSchema) : (mongoose.models.Guards || mongoose.model('Guards', MongooseSchema))