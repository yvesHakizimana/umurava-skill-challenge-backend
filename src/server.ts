import App from './app'
import ChallengeRouter from "@routes/challenge-router";
import AuthRouter from "@routes/auth-router";

const app = new App(
    [   new AuthRouter(),
        new ChallengeRouter()
    ]
);

app.listen()