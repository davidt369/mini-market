export interface Product {
    id: number;
    name: string;
    unit_cost?: number;
}

export interface PurchaseItem {
    id?: number;
    product?: Product;
    product_id?: number;
    qty: number;
    unit_cost?: number;
    subtotal?: number;
}

export interface Purchase {
    id: number;
    purchase_date?: string;
    supplier_name?: string;
    total?: number;
    items?: PurchaseItem[];
}
