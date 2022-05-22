import mongoose from 'mongoose'

const minLengthEmail = process.env.NEXT_PUBLIC_MIN_LENGTH_EMAIL;
const maxLengthEmail = process.env.NEXT_PUBLIC_MAX_LENGTH_EMAIL;

const MongooseSchema = new mongoose.Schema({
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
  email: {
    type: String,
    unique: [true, 'Электронная почта уже зарегестрирована'],
    required: [true, 'Пожалуйста, введите текст'],
    minlength: [minLengthEmail, `Электронная почта не может содержать больше ${minLengthEmail} символов`],
    maxlength: [maxLengthEmail, `Электронная почта не может содержать больше ${maxLengthEmail} символов`],
  },
  password: {
    type: String,
    required: [true, 'Пожалуйста, введите пароль']
  },
  isActivated: {
    type: Boolean,
    default: false,
  },
  activationLink: {
    type: String
  },
  uiAvatarsSrc: {
    type: String
  },
  positions: {
    type: [String]
  }
})

export default mongoose.models == null ? mongoose.model('User', MongooseSchema) : (mongoose.models.User || mongoose.model('User', MongooseSchema))