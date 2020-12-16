const { request } = require('express');
const Log = require('../models/Log');

const { Router } = request('expres');

module.exports = Router()
  .post('/', (req, res, next) => {
    Log
      .insert(req.body)
      .then(log => res.send(log))
      .catch(next);
  });
