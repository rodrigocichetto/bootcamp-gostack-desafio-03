import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const { student, plan, start_date, end_date, price } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Matrícula realizada com sucesso!',
      template: 'registration',
      context: {
        student,
        plan,
        start_date: format(parseISO(start_date), 'dd/MMM/yyyy'),
        end_date: format(parseISO(end_date), 'dd/MMM/yyyy HH:mm'),
        price: price.toFixed(2),
      },
    });
  }
}

export default new RegistrationMail();
