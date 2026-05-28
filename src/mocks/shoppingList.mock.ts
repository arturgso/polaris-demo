import { STATUS, type ShoppingItem } from "../types/ShoppingList";

export const ShoppingListMock: ShoppingItem[] = [
  {
    id: crypto.randomUUID().toString(),
    title: "Monitor 27 polegadas",
    link: "https://example.com/monitor-27-polegadas",
    price: "R$ 1.299,90",
    category: "tech",
    status: STATUS.PLANNED,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: crypto.randomUUID().toString(),
    title: "Cadeira ergonomica",
    link: "https://example.com/cadeira-ergonomica",
    price: "R$ 899,90",
    category: "others",
    status: STATUS.TO_BUY,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: crypto.randomUUID().toString(),
    title: "Mouse sem fio",
    link: "https://example.com/mouse-sem-fio",
    price: "R$ 159,90",
    category: "tech",
    status: STATUS.BOUGHT,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
