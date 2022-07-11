import mongoose from 'mongoose'

export const MongooseSchema = new mongoose.Schema({
  reason: {
    type: String
  },

  userPerfomed: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userPerfomedSheme'
  },

  userPerfomedSheme:{
    type: String,
    enum: ['User', 'UserArchive']
  },
  
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

export default mongoose.models == null ? mongoose.model('GuardsArchive', MongooseSchema) : (mongoose.models.GuardsArchive || mongoose.model('GuardsArchive', MongooseSchema))