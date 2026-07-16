"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const products_service_1 = require("./products.service");
let PublicProductsController = class PublicProductsController {
    products;
    constructor(products) {
        this.products = products;
    }
    list(query) {
        return this.products.list({ ...query, status: 'ACTIVE' });
    }
    featured() {
        return this.products.list({
            isFeatured: true,
            status: 'ACTIVE',
            pageSize: 8,
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });
    }
    newArrivals() {
        return this.products.list({
            status: 'ACTIVE',
            pageSize: 8,
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });
    }
    bestSelling() {
        return this.products.list({
            status: 'ACTIVE',
            pageSize: 8,
            sortBy: 'soldCount',
            sortOrder: 'desc',
        });
    }
    getBySlug(slug) {
        return this.products.getBySlug(slug, { status: 'ACTIVE' });
    }
};
exports.PublicProductsController = PublicProductsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicProductsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('featured'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicProductsController.prototype, "featured", null);
__decorate([
    (0, common_1.Get)('new-arrivals'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicProductsController.prototype, "newArrivals", null);
__decorate([
    (0, common_1.Get)('best-selling'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicProductsController.prototype, "bestSelling", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicProductsController.prototype, "getBySlug", null);
exports.PublicProductsController = PublicProductsController = __decorate([
    (0, swagger_1.ApiTags)('Products'),
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], PublicProductsController);
//# sourceMappingURL=public-products.controller.js.map