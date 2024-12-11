export interface UserAndToken {
    userId: string;
    token: string;
}

export const createUserAndTokenLocal = async (): Promise<UserAndToken> => {
    return {
        userId: '',
        token: ''
    }
};

export const createUserAndToken = async (): Promise<UserAndToken> => {
    return {
        userId: '8:acs:123',
        token: 'e123'
    }
}