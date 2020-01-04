import { Op } from 'sequelize';
import { startOfWeek, endOfWeek } from 'date-fns';

import Checkin from '../models/Checkin';
import Student from '../models/Student';
import Registration from '../models/Registration';

import { PAGINATION_LIMIT } from '../../config/constants';

class CheckinController {
  async index(req, res) {
    const { id: student_id } = req.params;
    const { page = 1 } = req.query;

    const checkins = await Checkin.findAndCountAll({
      limit: PAGINATION_LIMIT,
      offset: (page - 1) * PAGINATION_LIMIT,
      where: {
        student_id,
      },
      order: [['id', 'DESC']],
    });

    return res.json({
      checkins: checkins.rows,
      pages: Math.ceil(checkins.count / PAGINATION_LIMIT),
      total: checkins.count,
    });
  }

  async store(req, res) {
    const { id: student_id } = req.params;

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(401).json({ error: 'Student not found' });
    }

    const registration = await Registration.findAll({
      where: {
        student_id,
      },
    });

    if (!registration.length) {
      return res.status(401).json({ error: 'Student not registred' });
    }

    const today = new Date();

    const weekCheckins = await Checkin.findAll({
      where: {
        student_id,
        created_at: {
          [Op.between]: [startOfWeek(today), endOfWeek(today)],
        },
      },
    });

    if (weekCheckins.length >= 5) {
      return res.status(401).json({ error: 'Checkins overflowed' });
    }

    const checkin = await Checkin.create({ student_id });

    return res.json(checkin);
  }
}

export default new CheckinController();
