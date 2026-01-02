import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function ProtectedAction({ children, onAllowed }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    onAllowed();
  };

  return (
    <span onClick={handleClick} style={{ cursor: "pointer" }}>
      {children}
    </span>
  );
}

export default ProtectedAction;
