import mongoose from 'mongoose'

export const MongooseSchema = new mongoose.Schema({
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

export default mongoose.models == null ? mongoose.model('SimCards', MongooseSchema) : (mongoose.models.SimCards || mongoose.model('SimCards', MongooseSchema))