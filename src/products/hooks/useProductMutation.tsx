import { useMutation } from "@tanstack/react-query";
import { productActions } from "..";

export const useProductMutation = () => {
  const mutation = useMutation({
    mutationFn: productActions.createProduct,
  });

  return mutation;
};
