import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpOrderController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const helpOrders = await HelpOrder.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      where: {
        answer: null,
      },
      attributes: ['id', 'question', 'answer', 'answer_at'],
      include: {
        model: Student,
        as: 'student',
        attributes: ['name', 'email'],
      },
    });

    return res.json(helpOrders);
  }

  async show(req, res) {
    const { page = 1 } = req.query;

    const helpOrders = await HelpOrder.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      where: {
        student_id: req.params.id,
      },
      attributes: ['id', 'question', 'answer', 'answer_at'],
    });

    return res.json(helpOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .required()
        .min(0),
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const student = await Student.findByPk(req.params.id, {
      attributes: ['name', 'email'],
    });

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const { id, question, answer } = await HelpOrder.create(req.body);

    return res.json({
      id,
      student,
      question,
      answer,
    });
  }
}

export default new HelpOrderController();
