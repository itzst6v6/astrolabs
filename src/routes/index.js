const express = require('express');
const v2 = require('./v2/api.routes');
const router = express.Router();

router.use('/v2', v2);

module.exports = router;
