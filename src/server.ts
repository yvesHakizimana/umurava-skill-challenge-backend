import App from './app'
import ChallengeRouter from "@routes/challenge-router";
import AuthRouter from "@routes/auth-router";
import AdminRouter from "@routes/admin-router";

const app = new App(
    [   new AuthRouter(),
        new AdminRouter(),
        new ChallengeRouter()
    ]
);

app.listen()