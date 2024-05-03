"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var productController_1 = require("../controllers/productController");
var router = express_1.default.Router();
router.get('/products', productController_1.getProducts);
router.get('/product/:productId', productController_1.getProduct);
router.post('/product/create', productController_1.createProduct);
router.put('/update/:productId', productController_1.updateProduct);
router.delete('/delete/:productId', productController_1.deleteProduct);
exports.default = router;
