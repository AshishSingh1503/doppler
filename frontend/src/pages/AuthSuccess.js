import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function AuthSuccess({ setAuth }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      setAuth(true);
      navigate("/dashboard");
    }
  }, []);

  return <p>Authenticating...</p>;
}

export default AuthSuccess;
