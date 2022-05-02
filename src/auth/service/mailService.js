import nodemailer from "nodemailer";

class MailService {

    constructor() {

        this.transport = nodemailer.createTransport({
            host: process.env.NEXT_PRIVATE_MAIL_ACTIVATE_LINK_SMTP_HOST,
            port: process.env.NEXT_PRIVATE_MAIL_ACTIVATE_LINK_SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.NEXT_PRIVATE_MAIL_ACTIVATE_LINK_SMTP_USER,
                pass: process.env.NEXT_PRIVATE_MAIL_ACTIVATE_LINK_SMTP_PASSWORD,
            }
        });

    }

    async sendActivationMail(to, link) {

        await this.transport.sendMail({
            from: process.env.NEXT_PRIVATE_MAIL_ACTIVATE_LINK_SMTP_USER,
            to: to,
            subject: "Активация аккаунта на " + process.env.NEXT_PUBLIC_API_URL,
            text: "",
            html: `
                <div>
                    <h1>Для активации аккаунта перейдите по ссылке ниже</h1>
                    ${link}
                </div>
            `
        });

    }
}

export default new MailService();