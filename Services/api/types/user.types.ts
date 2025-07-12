export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
    role?: string;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
}

export interface SearchHistoryItem {
    id: string;
    reg_name: string;
    model: string;
}

export interface SearchHistoryResponse {
    history: SearchHistoryItem[];
}

export interface GarageData {
    id: string;
    reg_name: string;
    model: string;
}

export interface GarageResponse {
    name: string;
    GarageData: GarageData[];
}