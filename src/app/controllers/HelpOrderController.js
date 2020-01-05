import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

import { PAGINATION_LIMIT } from '../../config/constants';

class HelpOrderController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const helpOrders = await HelpOrder.findAndCountAll({
      limit: PAGINATION_LIMIT,
      offset: (page - 1) * PAGINATION_LIMIT,
      where: {
        answer: null,
      },
      attributes: ['id', 'question', 'answer', 'answer_at'],
      include: {
        model: Student,
        as: 'student',
        attributes: ['name', 'email'],
      },
      order: [['id', 'DESC']],
    });

    return res.json({
      help_orders: helpOrders.rows,
      pages: Math.ceil(helpOrders.count / PAGINATION_LIMIT),
    });
  }

  async show(req, res) {
    const { page = 1 } = req.query;

    const helpOrders = await HelpOrder.findAndCountAll({
      limit: PAGINATION_LIMIT,
      offset: (page - 1) * PAGINATION_LIMIT,
      where: {
        student_id: req.params.id,
      },
      attributes: ['id', 'question', 'answer', 'answer_at', 'createdAt'],
      order: [['id', 'DESC']],
    });

    return res.json({
      help_orders: helpOrders.rows,
      pages: Math.ceil(helpOrders.count / PAGINATION_LIMIT),
    });
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
