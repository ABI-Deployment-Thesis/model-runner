const router = require('express').Router()
const runnerController = require('../controllers/runner.controller')
const { isAuthenticated } = require('../middleware')
const utilsMulter = require('../../utils/multer')

router.get('/model-runs/:run_id', isAuthenticated, runnerController.getRunsById)
router.get('/model-runs', isAuthenticated, runnerController.getRuns)
router.post('/model-runs/:model_id', isAuthenticated, utilsMulter.uploadModel, runnerController.runModel)

module.exports = router;