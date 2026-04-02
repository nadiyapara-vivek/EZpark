export const saveAuth = (token, user) => {
  localStorage.setItem('ezpark_token', token);
  localStorage.setItem('ezpark_user', JSON.stringify(user));
};

export const getToken = () => localStorage.getItem('ezpark_token');

export const getUser = () => {
  const u = localStorage.getItem('ezpark_user');
  return u ? JSON.parse(u) : null;
};

export const isLoggedIn = () => !!getToken();

export const isAdmin = () => {
  const user = getUser();
  return user?.role === 'admin';
};

export const logout = () => {
  localStorage.removeItem('ezpark_token');
  localStorage.removeItem('ezpark_user');
};