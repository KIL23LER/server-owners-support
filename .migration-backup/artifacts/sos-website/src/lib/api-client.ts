const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  const token = localStorage.getItem("sos_session");
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("x-session-token", token);
  }
  return originalFetch(input, { ...init, headers });
};
