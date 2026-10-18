export type AuthFormState = {
  error: string | null;
  message: string | null;
};

export const initialAuthFormState: AuthFormState = {
  error: null,
  message: null,
};
