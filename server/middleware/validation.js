import Joi from 'joi';

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
    }
    next();
  };
};

// User validation schemas
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  bio: Joi.string().max(500).optional(),
  location: Joi.string().max(100).optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Event validation schemas
export const createEventSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  location: Joi.string().min(3).max(200).required(),
  image: Joi.string().uri().optional().allow(''),
  maxAttendees: Joi.number().integer().min(1).max(1000).required(),
  tags: Joi.array().items(Joi.string().max(20)).max(5).optional()
});

export const updateEventSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(10).max(1000).optional(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
  location: Joi.string().min(3).max(200).optional(),
  image: Joi.string().uri().optional().allow(''),
  maxAttendees: Joi.number().integer().min(1).max(1000).optional(),
  tags: Joi.array().items(Joi.string().max(20)).max(5).optional()
});