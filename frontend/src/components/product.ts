export interface Variant {
    id: number;
    size: string;
    color: string;
    stockQuantity: number;
}

export interface ProductImage {
    id: number;
    imageUrl: string;
    isMain: boolean;
}

export interface Category {
    id: number;
    name: string;
    description: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    categoryId: number;
    category?: Category;
    variants?: Variant[];
    images?: ProductImage[];
}