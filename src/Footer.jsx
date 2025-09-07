export default function Footer() {
    return (
      <footer className="footer">
        <div className="footer__content">
          <div>
            <strong>Created by Victor Suarez</strong> ·{" "}
            <a href="mailto:victormst@gmail.com">victormst@gmail.com</a>
          </div>
  
          <div className="footer__tech">
            <span className="badge">React</span>
            <span className="badge">Vite</span>
            <span className="badge">Firebase JS SDK (Auth/RTDB)</span>
            <span className="badge">@react-google-maps/api</span>
            <span className="badge">date-fns / date-fns-tz</span>
            <span className="badge">Node.js</span>
            <span className="badge">Express</span>
            <span className="badge">Firebase Admin SDK</span>
            <span className="badge">OpenWeatherMap API</span>
            <span className="badge">Zod</span>
            <span className="badge">Axios</span>
          </div>
        </div>
      </footer>
    );
  }
  