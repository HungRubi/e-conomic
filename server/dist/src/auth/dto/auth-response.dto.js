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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenPayload = exports.AuthResponse = exports.UserResponse = void 0;
const swagger_1 = require("@nestjs/swagger");
class UserResponse {
    id;
    email;
    name;
    role;
    createdAt;
    updatedAt;
}
exports.UserResponse = UserResponse;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    __metadata("design:type", String)
], UserResponse.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    __metadata("design:type", String)
], UserResponse.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    __metadata("design:type", String)
], UserResponse.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'customer' }),
    __metadata("design:type", String)
], UserResponse.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-06T10:00:00.000Z' }),
    __metadata("design:type", Date)
], UserResponse.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-06T10:00:00.000Z' }),
    __metadata("design:type", Date)
], UserResponse.prototype, "updatedAt", void 0);
class AuthResponse {
    token;
    refreshToken;
    user;
}
exports.AuthResponse = AuthResponse;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponse.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponse.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: UserResponse }),
    __metadata("design:type", UserResponse)
], AuthResponse.prototype, "user", void 0);
class TokenPayload {
    sub;
    email;
    iat;
    exp;
}
exports.TokenPayload = TokenPayload;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    __metadata("design:type", String)
], TokenPayload.prototype, "sub", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    __metadata("design:type", String)
], TokenPayload.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1720000000 }),
    __metadata("design:type", Number)
], TokenPayload.prototype, "iat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1720604800 }),
    __metadata("design:type", Number)
], TokenPayload.prototype, "exp", void 0);
//# sourceMappingURL=auth-response.dto.js.map