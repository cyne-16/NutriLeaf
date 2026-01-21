import { Router } from 'express';
import { getProducts, getProductById, getProductsByCategory } from '../controllers/products.controller';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/category/:category', getProductsByCategory);

export default router;