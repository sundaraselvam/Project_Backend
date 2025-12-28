import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_later";

export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    console.log('Auth header:', authHeader.substring(0, 20) + '...');
    const [type, token] = authHeader.split(" ");
    if(type != "Bearer" || !token){
        console.log('No token or wrong type');
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:', decoded);
        req.user = decoded;
        next()        
    } catch (error) {
        console.log('Token verification failed:', error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}