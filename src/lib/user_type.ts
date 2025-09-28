export const UserType = {
    ADMINS: "admins",
    USERS: "users",
} as const;

export type UserType = typeof UserType[keyof typeof UserType];
