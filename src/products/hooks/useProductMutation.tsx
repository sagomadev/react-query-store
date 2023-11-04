import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, productActions } from "..";

export const useProductMutation = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: productActions.createProduct,
    onMutate: (product) => {
      const optimisticProduct = { id: Math.random(), ...product };

      queryClient.setQueryData<Product[]>(
        ["products", { filterKey: product.category }],
        (old) => {
          if (old) {
            return [...old, optimisticProduct];
          }
          return [optimisticProduct];
        }
      );
      return { optimisticProduct };
    },
    // onSuccess: (product) => {
    //   queryClient.invalidateQueries({
    //     queryKey: ["products", { filterKey: product.category }],
    //   });
    // },
    onSuccess: (product, vars, ctx) => {
      queryClient.removeQueries({
        queryKey: ["product", ctx?.optimisticProduct.id],
      });

      queryClient.setQueryData<Product[]>(
        ["products", { filterKey: product.category }],
        (old) => {
          if (old) {
            return old.map((cacheProduct) => {
              return cacheProduct.id === ctx?.optimisticProduct.id
                ? product
                : cacheProduct;
            });
          }
          return [product];
        }
      );
    },

    onError: (error, vars, ctx) => {
      queryClient.removeQueries({
        queryKey: ["product", ctx?.optimisticProduct.id],
      });

      queryClient.setQueryData<Product[]>(
        ["products", { filterKey: vars.category }],
        (old) => {
          if (!old) return [];

          return old.filter((cacheProduct) => {
            return cacheProduct.id !== ctx?.optimisticProduct.id;
          });
        }
      );
    },
  });

  return mutation;
};
