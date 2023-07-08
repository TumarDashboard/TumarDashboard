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
  
  msisdn: {
    type: String,
    required: [true, 'Пожалуйста, введите номер сим карты']
  },

  iccid: {
    type: String,
  },

  provider: {
    type: String,
  },

  protectedObjects: [{
    protectedObject:{
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'protectedObjects.protectedObjectSheme'
    },
    protectedObjectSheme:{
      type: String,
      default: 'ProtectedObjects',
      enum: ['ProtectedObjects', 'ProtectedObjectsArchive', null]
    },
    inProtectedObject: Boolean,
    mounted: Date,
    unmounted: Date,
  }],

}, { timestamps: true })

export default mongoose.models == null ? mongoose.model('SimCardsArchive', MongooseSchema) : (mongoose.models.SimCardsArchive || mongoose.model('SimCardsArchive', MongooseSchema))