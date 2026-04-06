import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { compareArrays } from '@/lib/utils';
import { Discount } from '@/types/product.types';

export type CartItem = {
  id: number;
  name: string;
  srcUrl: string;
  price: number;
  attributes: string[];
  discount: Discount;
  quantity: number;
};

export type RemoveCartItem = {
  id: number;
  attributes: string[];
};

export type Cart = {
  items: CartItem[];
  totalQuantities: number;
};

const calcAdjustedTotalPrice = (
  totalPrice: number,
  data: CartItem,
  quantity?: number
): number => {
  return (
    (totalPrice + data.discount.percentage > 0
      ? Math.round(data.price - (data.price * data.discount.percentage) / 100)
      : data.discount.amount > 0
      ? Math.round(data.price - data.discount.amount)
      : data.price) * (quantity ? quantity : data.quantity)
  );
};

interface CartState {
  cart: Cart | null;
  totalPrice: number;
  adjustedTotalPrice: number;
  coupon: {
    id: number;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    discount_amount: number;
  } | null;
  action: 'update' | 'add' | 'delete' | 'coupon' | null;
  addToCart: (item: CartItem) => void;
  removeCartItem: (item: RemoveCartItem) => void;
  remove: (item: RemoveCartItem & { quantity: number }) => void;
  clearCart: () => void;
  applyCoupon: (coupon: NonNullable<CartState['coupon']>) => void;
  removeCoupon: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: null,
      totalPrice: 0,
      adjustedTotalPrice: 0,
      coupon: null,
      action: null,

      addToCart: (payload: CartItem) => {
        set((state) => {
          // if cart is empty then add
          if (state.cart === null) {
            return {
              cart: {
                items: [payload],
                totalQuantities: payload.quantity,
              },
              totalPrice: state.totalPrice + payload.price * payload.quantity,
              adjustedTotalPrice:
                state.adjustedTotalPrice +
                calcAdjustedTotalPrice(state.totalPrice, payload),
              action: 'add' as const,
            };
          }

          // check item in cart
          const isItemInCart = state.cart.items.find(
            (item) =>
              payload.id === item.id &&
              compareArrays(payload.attributes, item.attributes)
          );

          if (isItemInCart) {
            return {
              cart: {
                ...state.cart,
                items: state.cart.items.map((eachCartItem) => {
                  if (
                    eachCartItem.id === payload.id
                      ? !compareArrays(
                          eachCartItem.attributes,
                          isItemInCart.attributes
                        )
                      : eachCartItem.id !== payload.id
                  )
                    return eachCartItem;

                  return {
                    ...isItemInCart,
                    quantity: payload.quantity + isItemInCart.quantity,
                  };
                }),
                totalQuantities: state.cart.totalQuantities + payload.quantity,
              },
              totalPrice: state.totalPrice + payload.price * payload.quantity,
              adjustedTotalPrice:
                state.adjustedTotalPrice +
                calcAdjustedTotalPrice(state.totalPrice, payload),
              action: 'update' as const,
            };
          }

          return {
            cart: {
              ...state.cart,
              items: [...state.cart.items, payload],
              totalQuantities: state.cart.totalQuantities + payload.quantity,
            },
            totalPrice: state.totalPrice + payload.price * payload.quantity,
            adjustedTotalPrice:
              state.adjustedTotalPrice +
              calcAdjustedTotalPrice(state.totalPrice, payload),
            action: 'add' as const,
          };
        });
      },

      removeCartItem: (payload: RemoveCartItem) => {
        set((state) => {
          if (state.cart === null) return state;

          const isItemInCart = state.cart.items.find(
            (item) =>
              payload.id === item.id &&
              compareArrays(payload.attributes, item.attributes)
          );

          if (!isItemInCart) return state;

          return {
            cart: {
              ...state.cart,
              items: state.cart.items
                .map((eachCartItem) => {
                  if (
                    eachCartItem.id === payload.id
                      ? !compareArrays(
                          eachCartItem.attributes,
                          isItemInCart.attributes
                        )
                      : eachCartItem.id !== payload.id
                  )
                    return eachCartItem;

                  return {
                    ...isItemInCart,
                    quantity: eachCartItem.quantity - 1,
                  };
                })
                .filter((item) => item.quantity > 0),
              totalQuantities: state.cart.totalQuantities - 1,
            },
            totalPrice: state.totalPrice - isItemInCart.price * 1,
            adjustedTotalPrice:
              state.adjustedTotalPrice -
              calcAdjustedTotalPrice(isItemInCart.price, isItemInCart, 1),
            action: 'update' as const,
          };
        });
      },

      remove: (payload: RemoveCartItem & { quantity: number }) => {
        set((state) => {
          if (!state.cart) return state;

          const isItemInCart = state.cart.items.find(
            (item) =>
              payload.id === item.id &&
              compareArrays(payload.attributes, item.attributes)
          );

          if (!isItemInCart) return state;

          return {
            cart: {
              ...state.cart,
              items: state.cart.items.filter((pItem) => {
                return pItem.id === payload.id
                  ? !compareArrays(pItem.attributes, isItemInCart.attributes)
                  : pItem.id !== payload.id;
              }),
              totalQuantities: state.cart.totalQuantities - isItemInCart.quantity,
            },
            totalPrice:
              state.totalPrice - isItemInCart.price * isItemInCart.quantity,
            adjustedTotalPrice:
              state.adjustedTotalPrice -
              calcAdjustedTotalPrice(
                isItemInCart.price,
                isItemInCart,
                isItemInCart.quantity
              ),
            action: 'delete' as const,
          };
        });
      },

      clearCart: () => {
        set({
          cart: null,
          totalPrice: 0,
          adjustedTotalPrice: 0,
          coupon: null,
          action: null,
        });
      },

      applyCoupon: (coupon) => {
        set({ coupon, action: 'coupon' as const });
      },

      removeCoupon: () => {
        set({ coupon: null, action: 'coupon' as const });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
