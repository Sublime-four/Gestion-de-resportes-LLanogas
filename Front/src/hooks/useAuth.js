import { useAuthContext } from "../store/AuthContext";

export default function useAuth() {
  return useAuthContext();
}
