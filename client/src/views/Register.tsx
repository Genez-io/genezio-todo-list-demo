import { Button, Card, Container, Row, Col, Input } from "reactstrap";
import { useState } from "react";
import { AuthService } from "@genezio/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [error, setError] = useState("");

  async function handleSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!email || !password || !password2 || !name) {
      setError("All fields are mandatory");
      return;
    }
    if (password !== password2) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    
    try {
        await AuthService.getInstance().register(email, password, name);
    } catch (e) {
        if (e instanceof Error) {
            setError(
                    `Unexpected error: ${
                    e.message
                    ? e.message
                    : "Please check the backend logs in the project dashboard - https://app.genez.io."
                    }`
            );
        } else {
            setError("An unexpected error occurred. Please try again.");
        }
        return
    }


      navigate("/login");
  }

  return (
    <Container className="mt-5">
      <Row className="mt-5">
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <Card className="p-4 mt-5">
            <div className="auth-wrapper">
              <div className="auth-inner">
                <form>
                  <h3>Sign Up</h3>
                  <span className="text-danger">{error}</span>
                  <div className="mb-3">
                    <label>Name</label>
                    <Input
                      className="form-control"
                      placeholder="Name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Email address</label>
                    <Input
                      className="form-control"
                      placeholder="Email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Password</label>
                    <Input
                      className="form-control"
                      placeholder="Password"
                      type="password"
                      autoComplete="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Password</label>
                    <Input
                      className="form-control"
                      placeholder="Repeat Password"
                      type="password"
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                    />
                  </div>
                  <div className="text-left">
                    <Button
                      type="submit"
                      color="primary"
                      onClick={(e) => handleSubmit(e)}
                    >
                      Submit
                    </Button>
                  </div>
                  <div className="mt-2">
                    <span>
                      Already have an account? <a href="/login">Login</a>
                    </span>
                  </div>
                </form>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
