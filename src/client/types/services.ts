export type ServiceHandlers<TData = any, TError = any> = {
  onError?: (error: TError) => void;
  onSuccess?: (data: TData) => void;
}
