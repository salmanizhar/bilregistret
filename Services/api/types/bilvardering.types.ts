// Bilvardering Pro API Types

export interface BilvarderingProData {
    id?: string;
    name?: string;
    telefon?: string;
    email?: string;
    inpris?: string;
    utpris?: string;
    miltal?: string; // This is in mil (Swedish miles)
    comment?: string;
}

export interface CreateBilvarderingProRequest {
    reg_num: string;
    mileage?: number; // This should be in km for the API
    price_in?: number;
    price_out?: number;
    comments?: string;
    name?: string;
    telefon?: string;
    email?: string;
}

export interface BilvarderingProRecord {
    id: string;
    reg_num: string;
    user_id: string;
    organization_number: string;
    mileage?: number; // In km from API
    price_in?: number;
    price_out?: number;
    comments?: string;
    name?: string;
    telefon?: string;
    email?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface BilvarderingProResponse {
    success: boolean;
    data: BilvarderingProRecord;
}

export interface BilvarderingProListResponse {
    success: boolean;
    data: BilvarderingProRecord[];
}

export interface BilvarderingProError {
    success: false;
    error: string;
}