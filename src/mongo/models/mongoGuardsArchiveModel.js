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
    enum: ['User', 'UserArchive', null]
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

  iin:{
    type: [String]
  },

  guardPosts:{
    type:[mongoose.Schema.Types.ObjectId],
    ref: 'GuardPosts'
  }

}, { timestamps: true })

export default mongoose.models == null ? mongoose.model('GuardsArchive', MongooseSchema) : (mongoose.models.GuardsArchive || mongoose.model('GuardsArchive', MongooseSchema))