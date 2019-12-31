import * as Yup from 'yup';

import Plan from '../models/Plan';

import { PAGINATION_LIMIT } from '../../config/constants';

class PlanController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const plans = await Plan.findAndCountAll({
      limit: PAGINATION_LIMIT,
      offset: (page - 1) * PAGINATION_LIMIT,
      order: [['id', 'ASC']],
    });

    return res.json({
      plans: plans.rows,
      pages: Math.ceil(plans.count / PAGINATION_LIMIT),
    });
  }

  async show(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    return res.json(plan);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .required()
        .min(0),
      price: Yup.number()
        .required()
        .min(0),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number().min(0),
      price: Yup.number().min(0),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    const { id, title, duration, price } = await plan.update(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    await plan.destroy();

    return res.json(plan);
  }
}

export default new PlanController();
