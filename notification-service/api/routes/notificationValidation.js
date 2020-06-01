const Joi = require('@hapi/joi');

const verifySendEmail = {
    body : {
        to : Joi.array().required(),
        from : Joi.string().required(),
        subject : Joi.string().required(),
        body : Joi.string().optional(),
        templateId : Joi.string().optional(),
        dynamic_template_data : Joi.object().optional()
    }
}

module.exports = {
    verifySendEmail
}
