import * as Yup from 'yup';
import { startOfDay, endOfDay, addMonths, parseISO } from 'date-fns';

import Registration from '../models/Registration';
import Plan from '../models/Plan';
import Student from '../models/Student';

class RegistrationController {
  async index(req, res) {
    const registrations = await Registration.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price'],
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

    return res.json(registrations);
  }

  async show(req, res) {
    const registrations = await Registration.findAll({
      where: {
        id: req.params.id,
      },
      attributes: ['id', 'start_date', 'end_date', 'price'],
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

    if (!registrations.length) {
      return res.status(400).json({ error: 'Registration not found' });
    }

    return res.json(registrations);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .required()
        .min(0),
      plan_id: Yup.number()
        .required()
        .min(0),
      start_date: Yup.date()
        .required()
        .min(startOfDay(new Date())),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
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
      end_date: endOfDay(
        addMonths(parseISO(req.body.start_date), plan.duration)
      ),
      price: plan.duration * plan.price,
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
      start_date: Yup.date().min(startOfDay(new Date())),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
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
      startOfDay(parseISO(req.body.start_date)) !== registration.start_date
    ) {
      registration.start_date = req.body.start_date;

      if (!req.body.plan_id) {
        registration.end_date = endOfDay(
          addMonths(parseISO(req.body.start_date), registration.plan.duration)
        );
      }
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
