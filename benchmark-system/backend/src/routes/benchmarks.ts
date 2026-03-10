import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { BenchmarkService } from '../services/benchmarkService';
import { ReportService } from '../services/reportService';

const router = Router();
const benchmarkService = new BenchmarkService();
const reportService = new ReportService();

// Get all benchmarks with filters
router.get('/', authenticate, async (req, res, next) => {
  try {
    const filters = {
      projectId: req.query.projectId as string,
      category: req.query.category as string,
      manufacturer: req.query.manufacturer as string,
      minCost: req.query.minCost ? parseFloat(req.query.minCost as string) : undefined,
      maxCost: req.query.maxCost ? parseFloat(req.query.maxCost as string) : undefined,
      search: req.query.search as string,
    };
    
    const benchmarks = await benchmarkService.findAll(filters);
    res.json(benchmarks);
  } catch (error) {
    next(error);
  }
});

// Get single benchmark
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const benchmark = await benchmarkService.findById(req.params.id);
    if (!benchmark) {
      return res.status(404).json({ error: 'Benchmark not found' });
    }
    res.json(benchmark);
  } catch (error) {
    next(error);
  }
});

// Create benchmark
router.post('/', authenticate, authorize('ADMIN', 'MANAGER', 'ENGINEER'), async (req, res, next) => {
  try {
    const benchmark = await benchmarkService.create(req.body);
    res.status(201).json(benchmark);
  } catch (error) {
    next(error);
  }
});

// Update benchmark
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER', 'ENGINEER'), async (req, res, next) => {
  try {
    const benchmark = await benchmarkService.update(req.params.id, req.body);
    res.json(benchmark);
  } catch (error) {
    next(error);
  }
});

// Delete benchmark
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    await benchmarkService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Generate teardown report
router.post('/:id/reports/teardown', authenticate, async (req, res, next) => {
  try {
    const report = await reportService.generateTeardownReport(req.params.id);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

// Comparative analysis
router.post('/compare', authenticate, async (req, res, next) => {
  try {
    const { benchmarkIds } = req.body;
    const comparison = await benchmarkService.compare(benchmarkIds);
    res.json(comparison);
  } catch (error) {
    next(error);
  }
});

export { router as benchmarkRouter };