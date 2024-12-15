export interface UserAndToken {
    userId: string;
    token: string;
}

export const createUserAndToken = async (): Promise<UserAndToken> => {
    const response = await fetch('/token', {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data;
}