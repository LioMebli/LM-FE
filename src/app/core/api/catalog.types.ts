export type Availability = 'IN_STOCK' | 'MADE_TO_ORDER' | 'DISCONTINUED';

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  IN_STOCK: 'В наявності',
  MADE_TO_ORDER: 'Під замовлення',
  DISCONTINUED: 'Знято з виробництва',
};

export interface CategoryResponse {
  id: number;
  name: string;
}

export interface ProductSummary {
  id: number;
  categoryId: number;
  name: string;
}

export interface ProductDetail {
  id: number;
  categoryId: number;
  name: string;
  shortDescription: string | null;
  description: string | null;
  availability: Availability;
}

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  code: string;
  traceId?: string;
}

export const PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND';
export const CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND';
