const jwt = require("jsonwebtoken");

const JWT_SECRET = "secret"; // Make sure this matches the secret used to sign the token

module.exports = {
  auth: (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(403).json({ msg: "Missing auth header" });
    }

    // Check if the header starts with "Bearer "
    const tokenParts = authHeader.split(" ");
    console.log(tokenParts);
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(403).json({ msg: "Invalid auth header format" });
    }

    const token = tokenParts[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      //   console.log(decoded, decoded.id)
      if (decoded && decoded.id) {
        req.userId = decoded.id;
        //   console.log("Decoded Token:", decoded, req.userId);  // Log decoded token
        next();
      } else {
        return res.status(403).json({ msg: "Invalid token" });
      }
    } catch (error) {
      console.error("JWT Verification Error:", error.message); // Log verification error
      return res.status(403).json({ msg: "Invalid token" });
    }
  },
};
