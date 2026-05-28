export const STATUS = {
  IDEA: "idea",
  PLANNED: "planned",
  TO_BUY: "to_buy",
  BOUGHT: "bought",
  CANCELED: "canceled",
} as const;

export const STATUS_LABELS = {
  idea: "Ideia",
  planned: "Planejado",
  to_buy: "Para Comprar",
  bought: "Comprado",
  canceled: "Cancelado",
} as const;

export const CATEGORY = {
  tech: "tech",
  health: "saúde",
  makeup: "maquiagem",
  others: "outros",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];
export type Category = keyof typeof CATEGORY;

export interface ShoppingItem {
    id: string;
    title: string;
    link: string;
    category: Category;
    price: string;
    status: Status;
    createdAt: Date;
    updatedAt: Date;
}
