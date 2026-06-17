import { setAuthTokenGetter } from "@workspace/api-client-react";

export function syncAuthToken(): void {
  setAuthTokenGetter(() => localStorage.getItem("sos_session"));
}

syncAuthToken();
