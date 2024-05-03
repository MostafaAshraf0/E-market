"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var mongoose_1 = __importDefault(require("mongoose"));
var path_1 = __importDefault(require("path"));
var multer_1 = __importDefault(require("multer"));
var user_1 = __importDefault(require("./routes/user"));
var product_1 = __importDefault(require("./routes/product"));
var app = (0, express_1.default)();
var fileStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var fileFilter = function (req, file, cb) {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
app.use(body_parser_1.default.json());
app.use((0, multer_1.default)({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use('/images', express_1.default.static(path_1.default.join(__dirname, '/images')));
app.use('/user', user_1.default);
app.use(product_1.default);
app.use(function (error, req, res, next) {
    console.log(error);
    var status = error.statusCode || 500;
    var message = error.message;
    res.status(status).json({ message: message });
});
var MONGODB_URI = 'mongodb+srv://mostafaashraf334:WYcZ6tE22UmPdt55@cluster0.s8regf6.mongodb.net/market?retryWrites=true&w=majority';
mongoose_1.default.connect(MONGODB_URI)
    .then(function (result) {
    console.log('mongo');
    app.listen(8080);
})
    .catch(function (err) { return console.log(err); });
