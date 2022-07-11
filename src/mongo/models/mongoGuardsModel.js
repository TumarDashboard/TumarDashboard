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

  manager:{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'managerSheme'
  },

  managerSheme:{
    type: String,
    enum: ['User', 'UserArchive']
  },

  guardPosts:{
    type:[mongoose.Schema.Types.ObjectId],
    ref: 'GuardPosts'
  }

})

export default mongoose.models == null ? mongoose.model('Guards', MongooseSchema) : (mongoose.models.Guards || mongoose.model('Guards', MongooseSchema))