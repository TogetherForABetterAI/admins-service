export const UserType = {
    ADMINS: "admins",
    USERS: "users",
    TOKENS: "tokens",
} as const;

export type UserType = typeof UserType[keyof typeof UserType];
