export type Discount = {
  amount: number;
  percentage: number;
};

export type Specification = {
  key: string;
  value: string;
};

export type FAQ = {
  id?: number;
  question: string;
  answer: string;
};

export type Review = {
  id: number;
  user: string;
  content: string;
  rating: number;
  date: string;
};

export type Product = {
  id: number;
  title: string;
  srcUrl: string;
  gallery?: string[];
  price: number;
  discount: Discount;
  rating: number;
  description?: string;
  long_description?: string;
  stock?: number;
  specifications?: Specification[];
  faqs?: FAQ[];
  reviews?: Review[];
};
