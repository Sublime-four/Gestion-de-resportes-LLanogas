// ---------- Guardia por permiso (usando permissions.js) ----------
import { can } from "../store/permissions";

function PermissionRoute({ permission, children }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Si no está autenticado, mándalo a login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si la ruta no define permiso, deja pasar
  if (!permission) return children;

  // Si no tiene ese permiso, lo mandas a donde prefieras
  if (!can(user, permission)) {
    return <Navigate to="/dashboard" replace />;
    // o a /forbidden si creas una página de error
  }

  return children;
}
