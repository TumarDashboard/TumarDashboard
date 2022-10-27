import { FInputInitials } from "../low/FInputInitials";
import { FInputEmail } from "../low/FInputEmail";
import { FInputPassword } from "../low/FInputPassword";
import { useStore } from "../hight/StoreProvider";
import { ApiError } from "../../middleware/exceptions";
import { useRouter } from "next/router";
import { useState } from 'react'
import { motion } from "framer-motion";
import Link from 'next/link';

const inputs = {
    initial: {
        y: -20,
        opacity: 0
    },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.7,
            ease: [0.6, -0.05, 0.01, 0.99],
        },
    },
};

const separator = {
    initial: {
        width: 0,
    },
    animate: {
        width: '100%',
        transition: {
            duration: 1,
            ease: [0.6, 0.05, 0.01, 0.99],
        },
    },
};

export default function FFormActivation({activatelink}) {

    /*
        Использование глобальных данных
    */
    const router = useRouter();
    const { MOBXuser, MOBXui } = useStore();
    /*
        Данные формы
    */
    const [onError, setOnError] = useState('');
    /*
        Данные инпутов
    */
    // Пароль
    const [inputPassword, setInputPassword] = useState('');
    const [isInputValidatePassword, setInputValidatePassword] = useState(false);
    const passwordChange = (password, validate) => {
        setInputPassword(password);
        setInputValidatePassword(validate)
        setOnError('');
    }
    // Проверка Пароля
    const [isInputValidatePasswordCheck, setInputValidatePasswordCheck] = useState(false);
    const passwordCheckChange = (password, validate) => {
        setInputValidatePasswordCheck(validate && password === inputPassword)
        setOnError('');
    }
    /*
        Функция регистрации
    */
    const registrationEnd = async (event) => {

        event.preventDefault()

        MOBXui.setLoading();

        try {

            await MOBXuser.registrationEnd( activatelink, inputPassword).then(()=>{
                router.push( '/dashboard' );
            })

        } catch (error) {

            if (error instanceof ApiError) {

                setOnError(error.message);

            } else {
                throw error
            }

        } finally {

            MOBXui.setLoading();

        }
    }
    /*
        ---------------
    */
    return (
        <div
            className="mx-auto w-full md:w-2/3 lg:w-1/3 text-color_A px-5 flex flex-col justify-center items-center"
        >

            {/* {Заголовок} */}
            <motion.div
                variants={inputs}
                className="mb-4 text-center"
            >
                <h1 className="text-2xl px-5 pt-10 font-medium text-blue-300 sm:text-2xl title-font">
                    Осталось ещё чуть чуть...
                </h1>
            </motion.div>

            {/* {Заголовок} */}
            <motion.div
                variants={inputs}
                className="mb-4 text-left"
            >
                <p className="text-base sm:text-sm font-medium text-color_A title-font">
                    Для активации Вашего аккаунта необходимо завершить регистрацию вводом пароля
                </p>
            </motion.div>

            {/* {Password} */}
            <motion.div
                className="mb-4 w-full"
                variants={inputs}
            >
                <FInputPassword
                    onPasswordChange={passwordChange}
                />
            </motion.div>

            {/* {PasswordCheck} */}
            <motion.div
                className="mb-4 w-full"
                variants={inputs}
            >
                <FInputPassword
                    onPasswordChange={passwordCheckChange}
                    placeholder="Введите повторно пароль"
                    id="password-check"
                />
            </motion.div>
            
            {/* {separator} */}
            <motion.div
                className="mb-4 w-full"
                variants={separator}
            >

                <hr />

            </motion.div>
            
            {/* {Кнопки управления} */}
            <motion.div
                className="flex flex-wrap justify-between items-center mb-4 w-full"
                variants={inputs}
            >
                <button
                    disabled={!(isInputValidatePassword && isInputValidatePasswordCheck)}
                    onClick={registrationEnd}
                    className="w-full md:w-1/3 lg:w-full
                        inline-flex items-center justify-center px-4 py-2 bg-red-600 
                        font-semibold capitalize text-white
                        border border-transparent rounded-md 
                        hover:bg-red-700 active:bg-red-700 focus:outline-none focus:border-red-700 focus:ring focus:ring-red-200 
                        disabled:opacity-25 transition"
                >
                    Завершить регистрацию
                </button>
            </motion.div>

            {/* {Ошибка} */}
            <motion.div
                animate={onError ? 'animate' : 'initial'}
                variants={inputs}
                className="flex flex-col w-full text-center w-full"
            >
                <h1 className="text-color_C italic break-words">
                    {onError}
                </h1>
            </motion.div>

        </div>
    );

};