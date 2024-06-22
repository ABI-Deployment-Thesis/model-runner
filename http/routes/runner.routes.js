const router = require('express').Router()
const runnerController = require('../controllers/runner.controller')
const { isAuthenticated } = require('../middleware')

router.get('/model-runs/:run_id', isAuthenticated, runnerController.getRunsById)
router.get('/model-runs', isAuthenticated, runnerController.getRuns)
router.post('/model-runs', isAuthenticated, runnerController.runModel)

module.exports = router;