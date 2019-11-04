import { format } from 'date-fns';
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
      subject: 'Matricula realizada com sucesso!',
      template: 'registration',
      context: {
        student,
        plan,
        start_date,
        end_date,
        price,
      },
    });
  }
}

export default new RegistrationMail();
