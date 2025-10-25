// fingoal-backend/middleware/auth.js
import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // depending on how you sign the token, adapt this:
    // e.g. jwt.sign({ user: { id: user._id } }, secret)
    req.user = decoded.user || decoded; 
    next();
  } catch {
    return res.status(401).json({ msg: "Token is not valid" });
  }
}
