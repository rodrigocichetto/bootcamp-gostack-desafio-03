import * as Yup from 'yup';
import { startOfDay, endOfDay, addMonths, parseISO, isBefore } from 'date-fns';

import RegistrationMail from '../jobs/RegistrationMail';
import Queue from '../../lib/Queue';

import Registration from '../models/Registration';
import Plan from '../models/Plan';
import Student from '../models/Student';

import { PAGINATION_LIMIT } from '../../config/constants';

class RegistrationController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const registrations = await Registration.findAndCountAll({
      limit: PAGINATION_LIMIT,
      offset: (page - 1) * PAGINATION_LIMIT,
      attributes: ['id', 'start_date', 'end_date', 'price', 'active'],
      include: [
        {
          model: Plan,
          as: 'plan',
        },
        {
          model: Student,
          as: 'student',
        },
      ],
      order: [['start_date', 'DESC']],
    });

    return res.json({
      registrations: registrations.rows,
      pages: Math.ceil(registrations.count / PAGINATION_LIMIT),
    });
  }

  async show(req, res) {
    const registration = await Registration.findByPk(req.params.id, {
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Plan,
          as: 'plan',
        },
        {
          model: Student,
          as: 'student',
        },
      ],
    });

    if (!registration) {
      return res.status(400).json({ error: 'Registration not found' });
    }

    return res.json(registration);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .required()
        .min(0),
      plan_id: Yup.number()
        .required()
        .min(0),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const parsedDate = parseISO(req.body.start_date);

    if (isBefore(parsedDate, startOfDay(new Date()))) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const student = await Student.findByPk(req.body.student_id, {
      attributes: ['name', 'email', 'age', 'weight', 'height'],
    });

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const plan = await Plan.findByPk(req.body.plan_id, {
      attributes: ['title', 'duration', 'price'],
    });

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    const { id, start_date, end_date, price } = await Registration.create({
      ...req.body,
      end_date: endOfDay(addMonths(parsedDate, plan.duration)),
      price: plan.duration * plan.price,
    });

    Queue.add(RegistrationMail.key, {
      student,
      plan,
      start_date,
      end_date,
      price,
    });

    return res.json({
      id,
      student,
      plan,
      start_date,
      end_date,
      price,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().min(0),
      plan_id: Yup.number().min(0),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const parsedDate = parseISO(req.body.start_date);

    if (isBefore(parsedDate, startOfDay(new Date()))) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const registration = await Registration.findByPk(req.params.id, {
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'duration', 'price'],
        },
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email', 'age', 'weight', 'height'],
        },
      ],
    });

    if (!registration) {
      return res.status(400).json({ error: 'Registration not found' });
    }

    if (
      req.body.start_date &&
      startOfDay(parsedDate) !== registration.start_date
    ) {
      registration.start_date = req.body.start_date;

      registration.end_date = endOfDay(
        addMonths(parsedDate, registration.plan.duration)
      );
    }

    if (req.body.plan_id && req.body.plan_id !== registration.plan_id) {
      const plan = await Plan.findByPk(req.body.plan_id, {
        attributes: ['title', 'duration', 'price'],
      });

      if (!plan) {
        return res.status(400).json({ error: 'Plan not found' });
      }

      registration.plan_id = req.body.plan_id;
      registration.plan = plan;

      registration.end_date = endOfDay(
        addMonths(registration.start_date, plan.duration)
      );

      registration.price = plan.duration * plan.price;
    }

    const {
      id,
      student,
      plan,
      start_date,
      end_date,
      price,
    } = await registration.save();

    return res.json({
      id,
      student,
      plan,
      start_date,
      end_date,
      price,
    });
  }

  async delete(req, res) {
    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res.status(400).json({ error: 'Registration not found' });
    }

    await registration.destroy();

    return res.json(registration);
  }
}

export default new RegistrationController();
