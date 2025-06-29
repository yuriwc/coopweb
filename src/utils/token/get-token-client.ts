export function getTokenClient(): string {
  if (typeof document === 'undefined') {
    return '';
  }
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => 
    cookie.trim().startsWith('token=')
  );
  
  return tokenCookie ? tokenCookie.split('=')[1] : '';
}