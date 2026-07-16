export declare class UserResponse {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AuthResponse {
    token: string;
    refreshToken: string;
    user: UserResponse;
}
export declare class TokenPayload {
    sub: string;
    email: string;
    iat: number;
    exp: number;
}
