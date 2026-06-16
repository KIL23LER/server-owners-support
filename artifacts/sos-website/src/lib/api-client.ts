import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react/custom-fetch";

// The generated API client uses customFetch, which uses native fetch.
// We intercept fetch globally to add our custom x-session-token header,
// because the backend expects it there instead of Authorization.
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  const token = localStorage.getItem("sos_session");
  const headers = new Headers(init?.headers);
  
  if (token) {
    headers.set("x-session-token", token);
  }
  
  const newInit = { ...init, headers };
  return originalFetch(input, newInit);
};

// Set base URL for API if needed, usually relative works fine if proxied.
// setBaseUrl("");
