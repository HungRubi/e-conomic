"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const categories_controller_1 = require("./categories.controller");
const categories_service_1 = require("./categories.service");
const products_controller_1 = require("./products.controller");
const products_service_1 = require("./products.service");
const public_products_controller_1 = require("./public-products.controller");
const public_categories_controller_1 = require("./public-categories.controller");
let CatalogModule = class CatalogModule {
};
exports.CatalogModule = CatalogModule;
exports.CatalogModule = CatalogModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [
            categories_controller_1.CategoriesController,
            products_controller_1.ProductsController,
            public_products_controller_1.PublicProductsController,
            public_categories_controller_1.PublicCategoriesController,
        ],
        providers: [categories_service_1.CategoriesService, products_service_1.ProductsService],
    })
], CatalogModule);
//# sourceMappingURL=catalog.module.js.map