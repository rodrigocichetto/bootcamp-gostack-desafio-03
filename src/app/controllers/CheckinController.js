import * as Yup from 'yup';
import { Op } from 'sequelize';
import { startOfWeek, endOfWeek } from 'date-fns';

import Checkin from '../models/Checkin';
import Student from '../models/User';

class CheckinController {
  async index(req, res) {
    const { id: student_id } = req.params;

    const checkins = await Checkin.findAll({
      where: {
        student_id,
      },
    });

    return res.json({
      checkins,
      total: checkins.length,
    });
  }

  async store(req, res) {
    const { id: student_id } = req.params;

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(401).json({ error: 'Student not found' });
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
