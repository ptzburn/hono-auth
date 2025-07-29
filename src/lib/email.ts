import FormData from "form-data";
import Mailgun from "mailgun.js";
import env from "../env.ts";

type EmailParams = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail({ to, subject, text }: EmailParams) {
  const mailgunDomain = env.MAILGUN_DOMAIN;
  const mailgunApiKey = env.MAILGUN_API_KEY;

  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: mailgunApiKey,
  });

  const messageData = {
    from: `Milan Hokkanen <noreply@${mailgunDomain}>`,
    to,
    subject,
    text,
  };

  try {
    const data = await mg.messages.create(mailgunDomain, messageData);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
