import { FInputInitials } from "../levelE_low/FInputInitials";
import { FInputEmail } from "../levelE_low/FInputEmail";
import { FInputPassword } from "../levelE_low/FInputPassword";
import { useStore } from "../levelA/StoreProvider";
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

export default function FFormRegistration() {

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

    // Фамилия
    const [inputSurname, setInputSurname] = useState('');

    const [isInputValidateSurname, setInputValidateSurname] = useState(false);

    const surnameChange = (surname, validate) => {
        setInputSurname(surname);
        setInputValidateSurname(validate)
        setOnError('');
    }

    // Имя
    const [inputFirstName, setInputFirstName] = useState('');

    const [isInputValidateFirstName, setInputValidateFirstName] = useState(false);

    const firstNameChange = (firstName, validate) => {
        setInputFirstName(firstName);
        setInputValidateFirstName(validate)
        setOnError('');
    }

    // Отчество
    const [inputPatronymic, setInputPatronymic] = useState('');

    const [isInputValidatePatronymic, setInputValidatePatronymic] = useState(false);

    const patronymicChange = (patronymic, validate) => {
        setInputPatronymic(patronymic);
        setInputValidatePatronymic(validate)
        setOnError('');
    }

    // Почта
    const [inputEmail, setInputEmail] = useState('');

    const [isInputValidateEmail, setInputValidateEmail] = useState(false);

    const emailChange = (email, validate) => {
        setInputEmail(email);
        setInputValidateEmail(validate)
        setOnError('');
    }

    // Пароль
    const [inputPassword, setInputPassword] = useState('');

    const [isInputValidatePassword, setInputValidatePassword] = useState(false);

    const passwordChange = (email, validate) => {
        setInputPassword(email);
        setInputValidatePassword(validate)
        setOnError('');
    }

    /*
        Функция регистрации
    */

    const registration = async (event) => {

        event.preventDefault()

        MOBXui.setLoading();

        try {

            await MOBXuser.registration(inputSurname, inputFirstName, inputPatronymic, inputEmail, inputPassword);

            router.push('/authorization/activatelink');

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
                <h1 className="text-2xl px-5 pt-10 font-medium text-color_A sm:text-3xl title-font">
                    Регистрация аккаунта
                </h1>
            </motion.div>

            {/* {Фамилия} */}
            <motion.div
                className="mb-4 w-full"
                variants={inputs}
            >
                <FInputInitials
                    id='family-name'
                    onChange={surnameChange}
                    placeholder='Фамилия'
                />
            </motion.div>

            {/* {Имя} */}
            <motion.div
                className="mb-4 w-full"
                variants={inputs}
            >
                <FInputInitials
                    id='FullName'
                    onChange={firstNameChange}
                    placeholder='Имя'
                />
            </motion.div>

            {/* {Отчество} */}
            <motion.div
                className="mb-4 w-full"
                variants={inputs}
            >
                <FInputInitials
                    id='additional-name'
                    onChange={patronymicChange}
                    placeholder='Отчество'
                />
            </motion.div>

            {/* {separator} */}
            <motion.div
                className="mb-4 w-full"
                variants={separator}
            >

                <hr />

            </motion.div>

            {/* {Email} */}
            <motion.div
                className="mb-4 w-full"
                variants={inputs}
            >
                <FInputEmail
                    onEmailChange={emailChange}
                />
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

            {/* {Кнопки управления} */}
            <motion.div
                className="flex flex-wrap justify-between items-center mb-4 w-full"
                variants={inputs}
            >
                <button
                    disabled={!(isInputValidateEmail && isInputValidatePassword && isInputValidateSurname && isInputValidateFirstName && isInputValidatePatronymic)}
                    onClick={registration}
                    className="w-full md:w-1/3 lg:w-full xl:w-1/3
                        inline-flex items-center justify-center px-4 py-2 bg-red-600 
                        font-semibold capitalize text-white
                        border border-transparent rounded-md 
                        hover:bg-red-700 active:bg-red-700 focus:outline-none focus:border-red-700 focus:ring focus:ring-red-200 
                        disabled:opacity-25 transition"
                >
                    Зарегистрировать
                </button>
                <Link href="/authorization/login" >
                    <a
                        className="w-full md:w-2/3 lg:w-full xl:w-2/3 
                        text-center md:text-right lg:text-center xl:text-right
                        py-2 md:py-0 lg:py-2 xl:py-0
                        text-color_C underline"
                    >
                        Использовать существующий аккаунт
                    </a>
                </Link>
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