export const PRODUCT_EVENTS = {
  CREATED: 'product.created',
  DELETED: 'product.deleted',
} as const;

export type ProductEvent = {
  event: (typeof PRODUCT_EVENTS)[keyof typeof PRODUCT_EVENTS];
  payload: {
    id: string;
    name?: string;
    description?: string;
    price?: string;
    timestamp: string;
  };
};
